'use client'
export default function FAB() {
  return (
    <button
      data-new-capture="true"
      className="md:hidden fixed z-40"
      style={{
        bottom: '24px',
        right: '16px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#0a0a0a',
        fontSize: '28px',
        fontWeight: '300',
        lineHeight: 1,
        boxShadow: '0 4px 16px rgba(232,171,94,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      +
    </button>
  )
}
