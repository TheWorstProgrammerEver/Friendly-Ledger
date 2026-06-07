import styles from './AsOfControl.module.scss'

type AsOfControlProps = {
  value: string
  onChange: (value: string) => void
  onReset: () => void
}

export const AsOfControl = ({ value, onChange, onReset }: AsOfControlProps) => (
  <section className={styles.control}>
    <label>
      <span id="as-of-title">As of</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>

    <button type="button" onClick={onReset}>Now</button>
  </section>
)
