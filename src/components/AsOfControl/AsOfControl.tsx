import { CalendarDays } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../lib/ui/Button/Button'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
import { fromLocalIsoDate, toLocalIsoDate } from '../../domain/date'
import styles from './AsOfControl.module.scss'

export type AsOfValue = Date | 'Now'

type AsOfControlProps = {
  currentDate: Date
  value: AsOfValue
  onChange: (value: AsOfValue) => void
}

const isNow = (value: AsOfValue): value is 'Now' => value === 'Now'

const changeDate = (value: string, onChange: (value: AsOfValue) => void) => {
  if (value) {
    onChange(fromLocalIsoDate(value))
  }
}

export const AsOfControl = ({ currentDate, value, onChange }: AsOfControlProps) => {
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const nowSelected = isNow(value)
  const menuDate = nowSelected ? currentDate : value
  const menuDateValue = toLocalIsoDate(menuDate)
  const buttonLabel = nowSelected ? 'As of now' : `As of ${menuDateValue}`

  useEffect(() => {
    if (!open) {
      return
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <section className={styles.control}>
      <div className={styles.picker} ref={controlRef}>
        <Button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <ResponsiveContent icon={<CalendarDays />}>{buttonLabel}</ResponsiveContent>
        </Button>

        {open && (
          <div className={styles.menu} role="group" aria-label="As of options">
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={nowSelected}
                onChange={(event) => onChange(event.target.checked ? 'Now' : currentDate)}
              />
              Now
            </label>

            <label>
              Date
              <input
                type="date"
                disabled={nowSelected}
                value={menuDateValue}
                onInput={(event) => changeDate(event.currentTarget.value, onChange)}
                onChange={(event) => changeDate(event.target.value, onChange)}
              />
            </label>
          </div>
        )}
      </div>
    </section>
  )
}
