'use client';

import { Bull4xWordmark } from '@/components/layout/Bull4xWordmark';
import {
  Search,
  Plus,
  LayoutGrid,
  Maximize2,
  PanelRight,
  ArrowDownUp,
  LayoutTemplate,
  ChartCandlestick,
  Newspaper,
  Calculator,
} from 'lucide-react';
import { clsx } from 'clsx';

export type TerminalSpaceId = 'balanced' | 'chart' | 'trading';

interface TerminalLeftRailProps {
  activeSpace: TerminalSpaceId;
  onSpaceChange: (id: TerminalSpaceId) => void;
  terminalMarketsOpen: boolean;
  onToggleMarkets: () => void;
  bottomPanelCollapsed: boolean;
  onToggleBottomPanel: () => void;
  onFocusSymbolSearch: () => void;
  chartExpanded: boolean;
  terminalNewsOpen: boolean;
  /** Right rail: symbol list + quotes */
  onPanelsSelectMarkets: () => void;
  /** Right rail: buy / sell order panel */
  onPanelsSelectOrder: () => void;
  /** Chart focus mode (expanded chart area; use with terminal page handler) */
  onExpandFullChart: () => void;
  /** Right rail: TradingView live news timeline */
  onPanelsSelectNews: () => void;
  /** Right rail: Risk calculator */
  terminalCalcOpen?: boolean;
  onPanelsSelectCalc?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block w-full text-center text-[8px] font-semibold tracking-[0.12em] text-text-tertiary/60 uppercase px-0.5 mt-3 mb-1.5 first:mt-0">
      {children}
    </span>
  );
}

function RailBtn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'w-9 h-9 rounded-md flex items-center justify-center transition-colors shrink-0',
        active
          ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(33,150,243,0.25)]'
          : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
      )}
    >
      {children}
    </button>
  );
}

export default function TerminalLeftRail({
  activeSpace,
  onSpaceChange,
  terminalMarketsOpen,
  onToggleMarkets,
  bottomPanelCollapsed,
  onToggleBottomPanel,
  onFocusSymbolSearch,
  chartExpanded,
  terminalNewsOpen,
  onPanelsSelectMarkets,
  onPanelsSelectOrder,
  onExpandFullChart,
  onPanelsSelectNews,
  terminalCalcOpen,
  onPanelsSelectCalc,
}: TerminalLeftRailProps) {
  return (
    <aside
      className="shrink-0 w-[52px] flex flex-col items-stretch border-r border-border-primary bg-bg-secondary z-[5]"
      aria-label="Terminal toolbar"
    >
      <div className="flex flex-col items-center gap-0.5 pt-2 pb-1 px-1.5 border-b border-border-primary">
        <div className="mb-1 flex justify-center w-full">
          <Bull4xWordmark href="/accounts" variant="rail" />
        </div>
        <RailBtn title="Search symbols" onClick={onFocusSymbolSearch}>
          <Search size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn title="Markets / add symbol" onClick={onToggleMarkets}>
          <Plus size={17} strokeWidth={1.75} />
        </RailBtn>
      </div>

      <div className="flex-1 flex flex-col items-center px-1.5 overflow-y-auto overflow-x-hidden min-h-0 py-1">
        <SectionLabel>Spaces</SectionLabel>
        <RailBtn
          title="Balanced layout"
          active={activeSpace === 'balanced'}
          onClick={() => onSpaceChange('balanced')}
        >
          <LayoutGrid size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Chart focus — wider chart"
          active={activeSpace === 'chart'}
          onClick={() => onSpaceChange('chart')}
        >
          <Maximize2 size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Order focus — wider order column"
          active={activeSpace === 'trading'}
          onClick={() => onSpaceChange('trading')}
        >
          <PanelRight size={17} strokeWidth={1.75} />
        </RailBtn>

        <SectionLabel>Panels</SectionLabel>
        <RailBtn
          title="Markets — symbols & prices"
          active={terminalMarketsOpen && !chartExpanded && !terminalNewsOpen}
          onClick={onPanelsSelectMarkets}
        >
          <ArrowDownUp size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Buy / Sell — order panel"
          active={!terminalMarketsOpen && !chartExpanded && !terminalNewsOpen}
          onClick={onPanelsSelectOrder}
        >
          <LayoutTemplate size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Chart focus — max chart + buy/sell rail"
          active={chartExpanded && !terminalNewsOpen}
          onClick={onExpandFullChart}
        >
          <ChartCandlestick size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Live news — TradingView timeline"
          active={terminalNewsOpen && !chartExpanded}
          onClick={onPanelsSelectNews}
        >
          <Newspaper size={17} strokeWidth={1.75} />
        </RailBtn>
        {onPanelsSelectCalc && (
          <RailBtn
            title="Risk Calculator"
            active={!!terminalCalcOpen && !chartExpanded && !terminalNewsOpen}
            onClick={onPanelsSelectCalc}
          >
            <Calculator size={17} strokeWidth={1.75} />
          </RailBtn>
        )}
      </div>

      <div className="shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]" />
    </aside>
  );
}
