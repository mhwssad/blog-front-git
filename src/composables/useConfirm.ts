import { ElMessageBox } from 'element-plus'

interface ConfirmOptions {
  message: string
  title?: string
  type?: 'success' | 'warning' | 'info' | 'error'
}

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<void> => {
    return ElMessageBox.confirm(options.message, options.title ?? '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: options.type ?? 'warning',
    }).then(() => {})
  }

  return { confirm }
}
