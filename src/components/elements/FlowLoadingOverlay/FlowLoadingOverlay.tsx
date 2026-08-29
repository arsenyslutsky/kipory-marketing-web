import styles from './FlowLoadingOverlay.module.css';

type FlowLoadingOverlayProps = {
  active: boolean;
};

export function FlowLoadingOverlay({ active }: FlowLoadingOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.overlay}
      data-active={active}
      data-testid="flow-loader"
    >
      <span className={styles.trace}>
        <span className={styles.signal} />
      </span>
    </div>
  );
}
