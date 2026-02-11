interface Props {
  children: React.ReactNode
}

export function WorkspaceContainer({ children }: Props) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '2rem',
        margin: '1rem',
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  )
}
