# Nuxt 3 Auth Boilerplate

A production-ready Nuxt 3 boilerplate with authentication, state management, form validation, and a complete API layer architecture.

## Features

✅ **Complete Authentication Flow**
- Sign in / Sign up
- Email verification
- Forgot password / Reset password
- Protected routes with middleware
- Token-based authentication with auto-refresh

✅ **Robust API Layer**
- Centralized API client with `$fetch`
- Automatic Bearer token injection
- User-friendly error handling
- Request/response interceptors
- Auto-logout on 401

✅ **State Management**
- Pinia stores with TypeScript
- Persistent state with localStorage
- Token expiry management

✅ **Form Validation**
- Zod schemas for type-safe validation
- VeeValidate integration
- Pre-built auth form schemas

✅ **Modern UI Stack**
- Nuxt UI components
- Tailwind CSS v4
- Radix Vue (headless components)
- Lucide icons
- Fully responsive

✅ **Developer Experience**
- TypeScript strict mode
- Vitest for unit tests
- Playwright for E2E tests
- Auto-imports for components & composables
- ESLint configuration

## Project Structure

```
├── components/
│   ├── auth/              # Auth-related components
│   ├── app-form-card.vue  # Reusable form wrapper
│   └── logo-image.vue     # Logo component
├── composables/
│   ├── api/
│   │   └── useAuthApi.ts  # Auth API methods
│   ├── useApi.ts          # API wrapper with $api
│   └── useQueryParams.ts  # URL query params helper
├── layouts/
│   └── auth.vue           # Auth pages layout
├── middleware/
│   ├── auth.ts            # Redirect authenticated users
│   └── dashboard.ts       # Protect dashboard routes
├── pages/
│   ├── (auth)/            # Auth pages (signin, signup, etc.)
│   ├── dashboard.vue      # Protected dashboard
│   └── index.vue          # Root redirect
├── plugins/
│   └── api.ts             # API client setup
├── schemas/
│   └── index.ts           # Zod validation schemas
├── stores/
│   └── auth.ts            # Auth state management
├── types/
│   ├── api.ts             # API types
│   └── auth.ts            # Auth types
├── routes.ts              # Centralized route constants
└── nuxt.config.ts         # Nuxt configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone or use this boilerplate:
```bash
git clone <your-repo-url>
cd nuxt-auth-boilerplate
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your API base URL:
```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
```

4. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Configuration

### API Base URL

Configure your backend API URL in `.env`:

```env
NUXT_PUBLIC_API_BASE=https://api.yourapp.com/v1
```

Or in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
    }
  }
})
```

### Auth Token Expiry

The default token expiry is 2 days. Modify in [stores/auth.ts](stores/auth.ts):

```typescript
function setAuth({ user: newUser, token: newToken }: { user: UserData; token: string }) {
  user.value = newUser;
  token.value = newToken;
  expiry.value = Date.now() + 2 * 24 * 60 * 60 * 1000; // Change here
}
```

## Usage Guide

### Adding a New API Endpoint

1. Create a composable in `composables/api/`:

```typescript
// composables/api/useProductsApi.ts
import { HttpMethod, type ApiResponse } from '~/types/api';

export const useProductsApi = () => {
  const { $api } = useNuxtApp()

  const getProducts = () =>
    $api<ApiResponse<Product[]>>('/products', {
      method: HttpMethod.GET,
    })

  const createProduct = (data: CreateProductRequest) =>
    $api<ApiResponse<Product>>('/products', {
      method: HttpMethod.POST,
      body: data
    })

  return {
    getProducts,
    createProduct,
  }
}
```

2. Use in your component:

```vue
<script setup lang="ts">
const { getProducts } = useProductsApi();
const { data, error, pending } = await useApi('/products');
</script>
```

### Creating Protected Routes

Add middleware to your page:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard'
});
</script>
```

### Adding Form Validation

1. Define schema in `schemas/index.ts`:

```typescript
export const ProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().optional(),
});

export type ProductFormFields = z.infer<typeof ProductSchema>;
```

2. Use in component:

```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ProductSchema } from '~/schemas';

const formSchema = toTypedSchema(ProductSchema);

const onSubmit = async (values: any) => {
  // Handle form submission
};
</script>

<template>
  <UForm :schema="formSchema" @submit="onSubmit">
    <UFormField name="name">
      <UInput placeholder="Product name" />
    </UFormField>

    <UFormField name="price">
      <UInput type="number" placeholder="Price" />
    </UFormField>

    <UButton type="submit">Create Product</UButton>
  </UForm>
</template>
```

### Managing State with Pinia

Create a new store:

```typescript
// stores/products.ts
export const useProductsStore = defineStore('productsStore', () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);

  const fetchProducts = async () => {
    loading.value = true;
    try {
      const { getProducts } = useProductsApi();
      const response = await getProducts();
      products.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
  };
}, {
  persist: true, // Optional: persist to localStorage
});
```

## Testing

### Unit Tests

```bash
npm run test
# or with UI
npm run test:ui
```

### E2E Tests

```bash
npm run test:e2e
```

## Build & Deploy

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Static Generation

```bash
npm run generate
```

## Reference Documentation

See [BOILERPLATE_REFERENCE.md](BOILERPLATE_REFERENCE.md) for detailed code patterns and examples including:

- API Layer Architecture
- Authentication System
- Form Validation with Zod
- Route Protection
- Component Patterns
- State Management
- TypeScript Types
- Testing Patterns

## Key Files to Customize

When starting your new project, customize these files:

1. **package.json** - Update name, description, version
2. **.env** - Configure API URL
3. **nuxt.config.ts** - App meta tags, title, favicon
4. **components/logo-image.vue** - Replace with your logo
5. **routes.ts** - Add your app routes
6. **types/** - Add your domain types
7. **schemas/** - Add your validation schemas

## API Integration

This boilerplate expects a backend API with these auth endpoints:

- `POST /login` - User login
- `POST /register` - User registration
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /verify-email?token=xxx` - Verify email
- `POST /resend-verification` - Resend verification email

Expected response format:

```typescript
{
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

See [types/api.ts](types/api.ts) for full TypeScript interfaces.

## Tech Stack

- **Framework:** Nuxt 3
- **UI Library:** Nuxt UI + Radix Vue
- **Styling:** Tailwind CSS v4
- **State Management:** Pinia
- **Validation:** Zod + VeeValidate
- **HTTP Client:** ofetch ($fetch)
- **Icons:** Lucide Vue
- **Testing:** Vitest + Playwright
- **Type Checking:** TypeScript

## License

MIT

## Support

For issues or questions:
- Check [BOILERPLATE_REFERENCE.md](BOILERPLATE_REFERENCE.md) for code examples
- Review the [Nuxt 3 docs](https://nuxt.com/docs)
- Open an issue on GitHub

---

**Happy coding!** 🚀
