import { Button, ButtonProps } from 'antd'
import React, { useState } from 'react'

export interface LoadingButtonProps extends ButtonProps {
  onClick?: (e: React.MouseEvent) => Promise<void> | void
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ onClick, children, ...props }) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    if (onClick) {
      setLoading(true)
      try {
        await onClick(e)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Button loading={loading} onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}