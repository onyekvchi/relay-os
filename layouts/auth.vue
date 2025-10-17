<template>
  <section class="min-h-screen flex justify-center relative px-4 pt-24 bg-muted">
    <div class="w-full max-w-md z-10">
      <UCard>
        <div class="p-4 flex flex-col space-y-8">
          <slot />
        </div>
      </UCard>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-full w-full">
      <div class="w-xl h-full m-auto bg-[url(/assets/auth-bg.svg)] bg-contain bg-no-repeat bg-bottom"></div>
    </div>
  </section>
</template>