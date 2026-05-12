import mongoose from 'mongoose'
import MasterTrader from '../models/MasterTrader.js'
import CopyFollower from '../models/CopyFollower.js'
import CopyTrade from '../models/CopyTrade.js'
import CopyCommission from '../models/CopyCommission.js'
import CopySettings from '../models/CopySettings.js'
import Trade from '../models/Trade.js'
import TradingAccount from '../models/TradingAccount.js'
import Wallet from '../models/Wallet.js'
import tradeEngine from './tradeEngine.js'
import infowayService from './infowayService.js'

class CopyTradingEngine {
  constructor() {
    this.CONTRACT_SIZE = 100000
  }

  // Get today's date string
  getTradingDay() {
    return new Date().toISOString().split('T')[0]
  }

  // Calculate follower lot size based on copy mode
  // Note: BALANCE_BASED, EQUITY_BASED, and MULTIPLIER are calculated in copyTradeToFollowers
  // This function only handles FIXED_LOT mode
  calculateFollowerLotSize(masterLotSize, copyMode, copyValue, maxLotSize = 10) {
    let followerLot
    
    if (copyMode === 'FIXED_LOT') {
      // Use the fixed lot size specified by user
      followerLot = copyValue
      // Apply max lot size limit
      followerLot = Math.min(followerLot, maxLotSize)
      // Round to 2 decimal places
      return Math.round(followerLot * 100) / 100
    }
    
    // For BALANCE_BASED, EQUITY_BASED, MULTIPLIER - return master lot as placeholder
    // Actual calculation happens in copyTradeToFollowers with account data
    return masterLotSize
  }

  // Sum of live floating PnL for all open trades on an account (uses live infoway prices)
  async getAccountFloatingPnl(tradingAccountId) {
    const openTrades = await Trade.find({ tradingAccountId, status: 'OPEN' })
    let floating = 0
    for (const t of openTrades) {
      const px = infowayService.getPrice(t.symbol)
      if (px && Number(px.bid) > 0 && Number(px.ask) > 0) {
        floating += tradeEngine.calculateFloatingPnl(t, px.bid, px.ask)
      }
    }
    return floating
  }

  // Determine follower lot size from copy mode + master/follower account state.
  // Returns a finite, rounded, clamped lot >= 0.01 (and <= maxLotSize when set).
  computeFollowerLot(copyMode, masterQty, follower, masterBalance, masterEquity, followerBalance, followerEquity) {
    const round2 = (n) => Math.max(0.01, Math.round(n * 100) / 100)
    const clampMax = (n) => (follower.maxLotSize && follower.maxLotSize > 0 ? Math.min(n, follower.maxLotSize) : n)

    if (copyMode === 'FIXED_LOT') {
      return clampMax(round2(Number(follower.copyValue) || masterQty))
    }
    if (copyMode === 'MULTIPLIER' || copyMode === 'LOT_MULTIPLIER') {
      const m = Number(follower.multiplier) || Number(follower.copyValue) || 1
      return clampMax(round2(masterQty * m))
    }
    if (copyMode === 'BALANCE_BASED') {
      const lot = masterBalance > 0 ? masterQty * (followerBalance / masterBalance) : masterQty
      return clampMax(round2(lot))
    }
    // EQUITY_BASED and AUTO share the same formula
    if (copyMode === 'EQUITY_BASED' || copyMode === 'AUTO') {
      const lot = masterEquity > 0 ? masterQty * (followerEquity / masterEquity) : masterQty
      return clampMax(round2(lot))
    }
    // Unknown mode — fall back to master qty (already clamped/rounded)
    return clampMax(round2(masterQty))
  }

  // Copy master trade to all active followers
  async copyTradeToFollowers(masterTrade, masterId) {
    // Only mirror trades that are actually open. Pending master orders are mirrored
    // when they fill (see tradeEngine.checkPendingOrders), not at placement time.
    if (masterTrade.status && masterTrade.status !== 'OPEN') {
      console.log(`[CopyTrade] Master trade ${masterTrade._id} status=${masterTrade.status}, skipping copy until fill`)
      return []
    }

    const master = await MasterTrader.findById(masterId)
    if (!master || master.status !== 'ACTIVE') {
      console.log(`Master ${masterId} not active, skipping copy`)
      return []
    }

    // Get all active followers for this master
    const followers = await CopyFollower.find({
      masterId: masterId,
      status: 'ACTIVE'
    })

    console.log(`[CopyTrade] Found ${followers.length} active followers for master ${masterId}`)

    if (followers.length === 0) {
      console.log(`[CopyTrade] No active followers found for master ${masterId}`)
      return []
    }

    const tradingDay = this.getTradingDay()

    // Compute master balance + equity ONCE (shared across all followers).
    const masterAccount = await TradingAccount.findById(master.tradingAccountId)
    const masterBalance = masterAccount ? masterAccount.balance : 0
    const masterFloatingPnl = masterAccount
      ? await this.getAccountFloatingPnl(masterAccount._id)
      : 0
    const masterEquity = masterAccount
      ? masterAccount.balance + (masterAccount.credit || 0) + masterFloatingPnl
      : 0

    // Process ALL followers in parallel for faster execution
    const copyPromises = followers.map(async (follower) => {
      try {
        console.log(`[CopyTrade] Processing follower ${follower._id}: copyMode=${follower.copyMode}, copyValue=${follower.copyValue}, maxLotSize=${follower.maxLotSize}`)

        // Check if already copied for this specific follower (prevent duplicates per follower)
        const existingFollowerCopy = await CopyTrade.findOne({
          masterTradeId: masterTrade._id,
          followerId: follower._id
        })

        if (existingFollowerCopy) {
          console.log(`[CopyTrade] Trade already copied for follower ${follower._id}, skipping`)
          return {
            followerId: follower._id,
            status: 'SKIPPED',
            reason: 'Already copied'
          }
        }

        // Validate follower account
        const followerAccount = await TradingAccount.findById(follower.followerAccountId)
        if (!followerAccount || followerAccount.status !== 'Active') {
          return {
            followerId: follower._id,
            status: 'FAILED',
            reason: 'Account not active'
          }
        }

        // Follower equity = balance + credit + live floating PnL
        const followerBalance = followerAccount.balance
        const followerFloatingPnl = await this.getAccountFloatingPnl(followerAccount._id)
        const followerEquity = followerBalance + (followerAccount.credit || 0) + followerFloatingPnl

        const followerLotSize = this.computeFollowerLot(
          follower.copyMode,
          masterTrade.quantity,
          follower,
          masterBalance,
          masterEquity,
          followerBalance,
          followerEquity
        )

        console.log(
          `[CopyTrade] follower=${follower._id} mode=${follower.copyMode} ` +
          `masterBal=${masterBalance.toFixed(2)} masterEq=${masterEquity.toFixed(2)} ` +
          `followerBal=${followerBalance.toFixed(2)} followerEq=${followerEquity.toFixed(2)} ` +
          `masterLot=${masterTrade.quantity} -> followerLot=${followerLotSize}`
        )

        // Fetch live prices for the follower so the follower opens at their own spread,
        // not at master's already-spread-adjusted price (which would double-charge spread).
        const live = infowayService.getPrice(masterTrade.symbol)
        const liveBid = live && Number(live.bid) > 0 ? Number(live.bid) : null
        const liveAsk = live && Number(live.ask) > 0 ? Number(live.ask) : null
        // Fallback: if no live price, use master's openPrice for both sides (single-tick mirror).
        const openBid = liveBid ?? masterTrade.openPrice
        const openAsk = liveAsk ?? masterTrade.openPrice

        // Strip SL/TP that would be invalid on the follower's side (their openPrice
        // can differ from master's due to spread). Only strip the offending one.
        // Approximate follower openPrice for validation: ask for BUY, bid for SELL.
        const approxFollowerOpen = masterTrade.side === 'BUY' ? openAsk : openBid
        let sl = masterTrade.stopLoss ?? null
        let tp = masterTrade.takeProfit ?? null
        if (sl != null) {
          const slInvalid =
            (masterTrade.side === 'BUY' && sl >= approxFollowerOpen) ||
            (masterTrade.side === 'SELL' && sl <= approxFollowerOpen)
          if (slInvalid) {
            console.warn(`[CopyTrade] Dropping invalid SL ${sl} for follower ${follower._id} (open~${approxFollowerOpen})`)
            sl = null
          }
        }
        if (tp != null) {
          const tpInvalid =
            (masterTrade.side === 'BUY' && tp <= approxFollowerOpen) ||
            (masterTrade.side === 'SELL' && tp >= approxFollowerOpen)
          if (tpInvalid) {
            console.warn(`[CopyTrade] Dropping invalid TP ${tp} for follower ${follower._id} (open~${approxFollowerOpen})`)
            tp = null
          }
        }

        // Execute trade for follower — tradeEngine.openTrade handles spread, margin,
        // commission, and validation. We don't pre-check margin here to avoid
        // disagreeing with the authoritative check.
        console.log(`[CopyTrade] Opening trade for follower ${follower._id}: ${followerLotSize} lots ${masterTrade.symbol}`)
        let followerTrade
        try {
          followerTrade = await tradeEngine.openTrade(
            follower.followerId,
            followerAccount._id,
            masterTrade.symbol,
            masterTrade.segment,
            masterTrade.side,
            'MARKET',
            followerLotSize,
            openBid,
            openAsk,
            sl,
            tp
          )
        } catch (openErr) {
          // Record failed copy trade (e.g. insufficient margin, invalid SL/TP, market closed)
          await CopyTrade.create({
            masterTradeId: masterTrade._id,
            masterId: masterId,
            followerTradeId: null,
            followerId: follower._id,
            followerUserId: follower.followerId,
            followerAccountId: followerAccount._id,
            symbol: masterTrade.symbol,
            side: masterTrade.side,
            masterLotSize: masterTrade.quantity,
            followerLotSize: followerLotSize,
            copyMode: follower.copyMode,
            copyValue: follower.copyValue,
            masterOpenPrice: masterTrade.openPrice,
            followerOpenPrice: 0,
            status: 'FAILED',
            failureReason: openErr.message,
            tradingDay
          })
          return {
            followerId: follower._id,
            status: 'FAILED',
            reason: openErr.message
          }
        }

        // Record successful copy trade
        await CopyTrade.create({
          masterTradeId: masterTrade._id,
          masterId: masterId,
          followerTradeId: followerTrade._id,
          followerId: follower._id,
          followerUserId: follower.followerId,
          followerAccountId: followerAccount._id,
          symbol: masterTrade.symbol,
          side: masterTrade.side,
          masterLotSize: masterTrade.quantity,
          followerLotSize: followerLotSize,
          copyMode: follower.copyMode,
          copyValue: follower.copyValue,
          masterOpenPrice: masterTrade.openPrice,
          followerOpenPrice: followerTrade.openPrice,
          status: 'OPEN',
          tradingDay
        })

        // Update follower stats atomically (avoid races with parallel master trades)
        await CopyFollower.updateOne(
          { _id: follower._id },
          { $inc: { 'stats.totalCopiedTrades': 1, 'stats.activeCopiedTrades': 1 } }
        )

        // Update master stats atomically (avoid races across parallel followers)
        await MasterTrader.updateOne(
          { _id: masterId },
          { $inc: { 'stats.totalCopiedVolume': followerLotSize } }
        )

        console.log(`[CopyTrade] SUCCESS: Copied trade to follower ${follower._id}, lot size: ${followerLotSize}`)

        return {
          followerId: follower._id,
          status: 'SUCCESS',
          followerTradeId: followerTrade._id,
          lotSize: followerLotSize
        }

      } catch (error) {
        console.error(`[CopyTrade] Error copying trade to follower ${follower._id}:`, error)
        return {
          followerId: follower._id,
          status: 'FAILED',
          reason: error.message
        }
      }
    })

    // Wait for all copy operations to complete
    const copyResults = await Promise.all(copyPromises)

    const successCount = copyResults.filter(r => r.status === 'SUCCESS').length
    console.log(`[CopyTrade] Completed: ${successCount}/${followers.length} followers copied successfully`)

    return copyResults
  }

  // Mirror SL/TP modification to all follower trades (PARALLEL for speed)
  async mirrorSlTpModification(masterTradeId, newSl, newTp) {
    console.log(`[CopyTrade] Mirroring SL/TP to followers: masterTradeId=${masterTradeId}, SL=${newSl}, TP=${newTp}`)

    const masterOid =
      masterTradeId && mongoose.Types.ObjectId.isValid(String(masterTradeId))
        ? new mongoose.Types.ObjectId(String(masterTradeId))
        : masterTradeId

    const copyTrades = await CopyTrade.find({
      masterTradeId: masterOid,
      status: 'OPEN'
    })

    console.log(`[CopyTrade] Found ${copyTrades.length} follower trades to update SL/TP`)

    // Process ALL in parallel for instant sync
    const results = await Promise.all(copyTrades.map(async (copyTrade) => {
      try {
        await tradeEngine.modifyTrade(copyTrade.followerTradeId, newSl, newTp)
        console.log(`[CopyTrade] SL/TP updated for follower trade ${copyTrade.followerTradeId}`)
        return {
          copyTradeId: copyTrade._id,
          status: 'SUCCESS'
        }
      } catch (error) {
        console.error(`Error mirroring SL/TP to copy trade ${copyTrade._id}:`, error)
        return {
          copyTradeId: copyTrade._id,
          status: 'FAILED',
          reason: error.message
        }
      }
    }))

    console.log(`[CopyTrade] SL/TP mirror complete: ${results.filter(r => r.status === 'SUCCESS').length}/${copyTrades.length} success`)
    return results
  }

  // Close all follower trades when master closes (PARALLEL for speed)
  // bid/ask: use real quotes when available; legacy callers may pass (masterId, singlePrice) only.
  async closeFollowerTrades(masterTradeId, bid, ask) {
    let bidN
    let askN
    if (ask === undefined || ask === null) {
      const p = Number(bid)
      bidN = p
      askN = p
    } else {
      bidN = Number(bid)
      askN = Number(ask)
    }
    if (!Number.isFinite(bidN) || !Number.isFinite(askN) || bidN <= 0 || askN <= 0) {
      console.warn(`[CopyTrade] closeFollowerTrades: invalid bid/ask`, { masterTradeId, bid, ask })
      return []
    }

    console.log(`[CopyTrade] closeFollowerTrades masterTradeId=${masterTradeId} bid=${bidN} ask=${askN}`)

    const masterOid =
      masterTradeId && mongoose.Types.ObjectId.isValid(String(masterTradeId))
        ? new mongoose.Types.ObjectId(String(masterTradeId))
        : masterTradeId

    const copyTrades = await CopyTrade.find({
      masterTradeId: masterOid,
      status: 'OPEN'
    })

    console.log(`[CopyTrade] Found ${copyTrades.length} open copy trades to close for master trade ${masterTradeId}`)

    // Process ALL in parallel for instant close
    const results = await Promise.all(copyTrades.map(async (copyTrade) => {
      try {
        const followerTradeId = copyTrade.followerTradeId?._id ?? copyTrade.followerTradeId
        if (!followerTradeId) {
          console.warn(`[CopyTrade] CopyTrade ${copyTrade._id} has no followerTradeId, skipping`)
          return {
            copyTradeId: copyTrade._id,
            status: 'FAILED',
            reason: 'No follower trade id'
          }
        }
        // Close the follower trade (COPY = mirrored close; avoids confusion with USER in analytics)
        const result = await tradeEngine.closeTrade(
          followerTradeId,
          bidN,
          askN,
          'COPY'
        )

        const masterClosePx = result.trade.side === 'BUY' ? bidN : askN
        // Update copy trade record
        copyTrade.masterClosePrice = masterClosePx
        copyTrade.followerClosePrice = result.trade.closePrice
        copyTrade.followerPnl = result.realizedPnl
        copyTrade.status = 'CLOSED'
        copyTrade.closedAt = new Date()
        await copyTrade.save()

        // Update follower stats atomically (avoid races with parallel master closes)
        const pnl = result.realizedPnl
        const profitInc = pnl >= 0 ? pnl : 0
        const lossInc = pnl < 0 ? Math.abs(pnl) : 0
        await CopyFollower.updateOne(
          { _id: copyTrade.followerId },
          {
            $inc: {
              'stats.activeCopiedTrades': -1,
              'stats.totalProfit': profitInc,
              'stats.totalLoss': lossInc,
              dailyProfit: profitInc,
              dailyLoss: lossInc
            }
          }
        )

        console.log(`[CopyTrade] Closed follower trade ${followerTradeId}, PnL: ${result.realizedPnl}`)
        return {
          copyTradeId: copyTrade._id,
          status: 'SUCCESS',
          pnl: result.realizedPnl
        }

      } catch (error) {
        console.error(`Error closing copy trade ${copyTrade._id}:`, error)
        return {
          copyTradeId: copyTrade._id,
          status: 'FAILED',
          reason: error.message
        }
      }
    }))

    console.log(`[CopyTrade] Close complete: ${results.filter(r => r.status === 'SUCCESS').length}/${copyTrades.length} success`)
    return results
  }

  // Calculate and apply daily commission (run at end of day)
  async calculateDailyCommission(tradingDay = null) {
    const day = tradingDay || this.getTradingDay()
    
    // Get all closed copy trades for the day that haven't had commission applied
    const copyTrades = await CopyTrade.find({
      tradingDay: day,
      status: 'CLOSED',
      commissionApplied: false
    })

    // Group by master and follower
    const groupedTrades = {}
    for (const trade of copyTrades) {
      const key = `${trade.masterId}_${trade.followerId}`
      if (!groupedTrades[key]) {
        groupedTrades[key] = {
          masterId: trade.masterId,
          followerId: trade.followerId,
          followerUserId: trade.followerUserId,
          followerAccountId: trade.followerAccountId,
          trades: [],
          totalPnl: 0
        }
      }
      groupedTrades[key].trades.push(trade)
      groupedTrades[key].totalPnl += trade.followerPnl
    }

    const commissionResults = []

    for (const key in groupedTrades) {
      const group = groupedTrades[key]
      
      // Only apply commission on profitable days
      if (group.totalPnl <= 0) {
        // Mark trades as processed (no commission)
        for (const trade of group.trades) {
          trade.commissionApplied = true
          await trade.save()
        }
        continue
      }

      try {
        // Get master's commission percentage
        const master = await MasterTrader.findById(group.masterId)
        if (!master || !master.approvedCommissionPercentage) {
          // No commission to charge (e.g. master deleted, or 0% commission).
          // Mark trades processed so we don't reprocess them on the next cron run.
          await CopyTrade.updateMany(
            { _id: { $in: group.trades.map(t => t._id) } },
            { $set: { commissionApplied: true } }
          )
          continue
        }

        const commissionPercentage = master.approvedCommissionPercentage
        const adminSharePercentage = master.adminSharePercentage || 30

        // Calculate commission
        const totalCommission = group.totalPnl * (commissionPercentage / 100)
        const adminShare = totalCommission * (adminSharePercentage / 100)
        const masterShare = totalCommission - adminShare

        // Deduct from follower account (balance first, fall back to credit — matches
        // tradeEngine.closeTrade loss-handling).
        const followerAccount = await TradingAccount.findById(group.followerAccountId)
        const availableFunds = followerAccount
          ? followerAccount.balance + (followerAccount.credit || 0)
          : 0

        if (followerAccount && availableFunds >= totalCommission) {
          const loss = totalCommission
          if (followerAccount.balance >= loss) {
            followerAccount.balance -= loss
          } else {
            const remaining = loss - followerAccount.balance
            followerAccount.balance = 0
            followerAccount.credit = Math.max(0, (followerAccount.credit || 0) - remaining)
          }
          await followerAccount.save()

          // Create commission record
          await CopyCommission.create({
            masterId: group.masterId,
            followerId: group.followerId,
            followerUserId: group.followerUserId,
            followerAccountId: group.followerAccountId,
            tradingDay: day,
            dailyProfit: group.totalPnl,
            commissionPercentage,
            totalCommission,
            adminShare,
            masterShare,
            adminSharePercentage,
            status: 'DEDUCTED',
            deductedAt: new Date()
          })

          // Update master pending commission atomically
          await MasterTrader.updateOne(
            { _id: group.masterId },
            { $inc: { pendingCommission: masterShare, totalCommissionEarned: masterShare } }
          )

          // Update admin pool
          const settings = await CopySettings.getSettings()
          settings.adminCopyPool += adminShare
          await settings.save()

          // Update follower stats atomically
          await CopyFollower.updateOne(
            { _id: group.followerId },
            { $inc: { 'stats.totalCommissionPaid': totalCommission } }
          )

          // Mark trades as processed
          await CopyTrade.updateMany(
            { _id: { $in: group.trades.map(t => t._id) } },
            { $set: { commissionApplied: true } }
          )

          commissionResults.push({
            masterId: group.masterId,
            followerId: group.followerId,
            dailyProfit: group.totalPnl,
            commission: totalCommission,
            status: 'SUCCESS'
          })

        } else {
          // Insufficient funds for commission. Record FAILED and mark trades
          // as processed so we don't keep retrying the same day forever.
          await CopyCommission.create({
            masterId: group.masterId,
            followerId: group.followerId,
            followerUserId: group.followerUserId,
            followerAccountId: group.followerAccountId,
            tradingDay: day,
            dailyProfit: group.totalPnl,
            commissionPercentage,
            totalCommission,
            adminShare,
            masterShare,
            adminSharePercentage,
            status: 'FAILED',
            deductionError: 'Insufficient balance'
          })

          await CopyTrade.updateMany(
            { _id: { $in: group.trades.map(t => t._id) } },
            { $set: { commissionApplied: true } }
          )

          commissionResults.push({
            masterId: group.masterId,
            followerId: group.followerId,
            status: 'FAILED',
            reason: 'Insufficient balance'
          })
        }

      } catch (error) {
        console.error(`Error calculating commission for ${key}:`, error)
        commissionResults.push({
          masterId: group.masterId,
          followerId: group.followerId,
          status: 'FAILED',
          reason: error.message
        })
      }
    }

    return commissionResults
  }

  // Process master commission withdrawal to main wallet
  async processMasterWithdrawal(masterId, amount, adminId) {
    const master = await MasterTrader.findById(masterId)
    if (!master) throw new Error('Master not found')

    if (amount > master.pendingCommission) {
      throw new Error(`Insufficient pending commission. Available: $${master.pendingCommission.toFixed(2)}`)
    }

    const settings = await CopySettings.getSettings()
    if (amount < settings.commissionSettings.minPayoutAmount) {
      throw new Error(`Minimum payout amount is $${settings.commissionSettings.minPayoutAmount}`)
    }

    // Get or create user's main wallet
    let wallet = await Wallet.findOne({ userId: master.userId })
    if (!wallet) {
      wallet = await Wallet.create({ userId: master.userId, balance: 0 })
    }

    // Transfer commission to main wallet
    wallet.balance += amount
    await wallet.save()

    // Update master records
    master.pendingCommission -= amount
    master.totalCommissionWithdrawn += amount
    await master.save()

    return {
      amount,
      newPendingCommission: master.pendingCommission,
      newWalletBalance: wallet.balance
    }
  }

  // Close all follower trades when master is banned/suspended.
  // Falls back to infowayService live prices when caller doesn't pass a price for a symbol.
  async closeAllMasterFollowerTrades(masterId, currentPrices = {}) {
    const copyTrades = await CopyTrade.find({
      masterId,
      status: 'OPEN'
    })

    const results = []

    for (const copyTrade of copyTrades) {
      try {
        let price = currentPrices[copyTrade.symbol]
        if (!price) {
          const live = infowayService.getPrice(copyTrade.symbol)
          if (live && Number(live.bid) > 0 && Number(live.ask) > 0) {
            price = { bid: Number(live.bid), ask: Number(live.ask) }
          }
        }
        if (!price) {
          results.push({
            copyTradeId: copyTrade._id,
            status: 'FAILED',
            reason: `No price available for ${copyTrade.symbol}`
          })
          continue
        }

        const followerTradeId = copyTrade.followerTradeId?._id ?? copyTrade.followerTradeId
        if (!followerTradeId) {
          results.push({
            copyTradeId: copyTrade._id,
            status: 'FAILED',
            reason: 'No follower trade id'
          })
          continue
        }

        const result = await tradeEngine.closeTrade(
          followerTradeId,
          price.bid,
          price.ask,
          'ADMIN'
        )

        const masterClosePx = result.trade.side === 'BUY' ? price.bid : price.ask
        copyTrade.masterClosePrice = masterClosePx
        copyTrade.followerClosePrice = result.trade.closePrice
        copyTrade.followerPnl = result.realizedPnl
        copyTrade.status = 'CLOSED'
        copyTrade.closedAt = new Date()
        await copyTrade.save()

        // Update follower stats atomically (parity with closeFollowerTrades)
        const pnl = result.realizedPnl
        const profitInc = pnl >= 0 ? pnl : 0
        const lossInc = pnl < 0 ? Math.abs(pnl) : 0
        await CopyFollower.updateOne(
          { _id: copyTrade.followerId },
          {
            $inc: {
              'stats.activeCopiedTrades': -1,
              'stats.totalProfit': profitInc,
              'stats.totalLoss': lossInc,
              dailyProfit: profitInc,
              dailyLoss: lossInc
            }
          }
        )

        results.push({
          copyTradeId: copyTrade._id,
          status: 'SUCCESS',
          pnl: result.realizedPnl
        })

      } catch (error) {
        results.push({
          copyTradeId: copyTrade._id,
          status: 'FAILED',
          reason: error.message
        })
      }
    }

    return results
  }
}

export default new CopyTradingEngine()
