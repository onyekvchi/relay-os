<template>
  <section class="min-h-screen flex justify-center relative px-4 pt-24 bg-white">
    <div class="w-full max-w-md z-10">
      <div class="p-4 flex flex-col space-y-8">
        <slot />
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-full w-full">
      <div class="w-xl h-full m-auto"></div>
    </div>
  </section>
</template>