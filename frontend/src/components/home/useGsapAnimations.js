import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGsapScrollAnimation(ref, options = {}) {
  const {
    y = 50,
    opacity = 0,
    duration = 1,
    delay = 0,
    stagger = 0.1,
    ease = 'power3.out',
    start = 'top 85%',
    children = false
  } = options

  useEffect(() => {
    if (!ref.current) return

    const elements = children 
      ? ref.current.children 
      : [ref.current]

    gsap.fromTo(
      elements,
      { y, opacity },
      {
        y: 0,
        opacity: 1,
        duration,
        delay,
        stagger,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: 'play none none reverse'
        }
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [ref, y, opacity, duration, delay, stagger, ease, start, children])
}

export function useGsapFadeIn(ref, options = {}) {
  const { duration = 1, delay = 0, ease = 'power2.out' } = options

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  }, [ref, duration, delay, ease])
}

export function useGsapCounter(ref, endValue, options = {}) {
  const { duration = 2, delay = 0 } = options

  useEffect(() => {
    if (!ref.current) return

    const obj = { value: 0 }
    
    gsap.to(obj, {
      value: endValue,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.floor(obj.value).toLocaleString()
        }
      }
    })
  }, [ref, endValue, duration, delay])
}

export function useGsapStagger(ref, options = {}) {
  const {
    y = 30,
    opacity = 0,
    duration = 0.8,
    stagger = 0.15,
    ease = 'power3.out',
    start = 'top 85%'
  } = options

  useEffect(() => {
    if (!ref.current) return

    const children = ref.current.children

    gsap.fromTo(
      children,
      { y, opacity },
      {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: 'play none none reverse'
        }
      }
    )
  }, [ref, y, opacity, duration, stagger, ease, start])
}

export function useGsapParallax(ref, options = {}) {
  const { speed = 0.5 } = options

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }, [ref, speed])
}
