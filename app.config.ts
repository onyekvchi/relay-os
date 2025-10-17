export default defineAppConfig({
  ui: {
    colors: {
      primary: 'neutral',
      neutral: 'zinc'
    },
    icons: {
      loading: 'i-lucide-loader',
    },
    button: {
      slots: {
        base: 'shadow-none cursor-pointer'
      },
      variants: {
        variant: {
          ghost: 'shadow-none bg-transparent'
        },
      },
    },
    input: {
      slots: {
        base: 'shadow-xs'
      },
      variants: {
        size: {
          lg: {
            trailing: 'pe-2'
          },
          md: {
            trailing: 'pe-1.5'
          }
        }
      }
    },
    selectMenu: {
      slots: {
        base: 'shadow-xs'
      },
    },
    card: {
      slots: {
        root: 'shadow-sm'
      }
    },
    tabs: {
      slots: {
        root: 'gap-8',
        list: 'px-0 gap-6',
        trigger: 'font-medium cursor-pointer',
      },
      variants: {
        size: {
          md: {
            trigger: 'px-0'
          }
        }
      }
    },
    table: {
      slots: {
        tr: 'hover:cursor-pointer',
        separator: 'bg-(--ui-border-muted)',
        // td: 'px-0',
        // th: 'px-0'
      }
    },
    pagination: {
      slots: {
        item: 'font-normal'
      }
    },
  }
})
