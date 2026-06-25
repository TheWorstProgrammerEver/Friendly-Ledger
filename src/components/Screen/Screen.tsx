import type { ComponentProps } from 'react'
import styles from './Screen.module.scss'

type ScreenProps = ComponentProps<'section'>

export const Screen = ({ className, ...props }: ScreenProps) => (
  <section
    {...props}
    className={[styles.screen, className].filter(Boolean).join(' ')}
  />
)
