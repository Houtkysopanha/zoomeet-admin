<template>
  <div class="flex h-screen overflow-hidden bg-[#F8F8FF]">
    <!-- Sidebar -->
    <SidebarLeft class="w-[21rem] fixed h-full z-10 bg-transparent" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col ml-[20rem]">
      <!-- Header -->
      <!-- <HeaderTop class="h-16 fixed top-0 right-0 left-64 bg-white shadow-sm z-20 border-b border-gray-200" /> -->

      <!-- Main Content -->
      <main class=" mt-8 flex-1 overflow-y-auto bg-white">
        <div class="min-h-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
