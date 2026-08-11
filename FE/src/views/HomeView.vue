<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import LinkConverterCard from '../components/LinkConverterCard.vue'
import FeatureGrid from '../components/FeatureGrid.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-[#fafafd] selection:bg-orange-100 selection:text-orange-600">
    <div>
      <!-- Navigation Bar -->
      <Navbar />

      <!-- Main Section -->
      <main class="relative overflow-hidden">
        <!-- Hero Title & Subtitle -->
        <HeroSection />

        <!-- Link Converter Card Component -->
        <LinkConverterCard />

        <!-- Bottom Feature Cards Grid -->
        <FeatureGrid />
      </main>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>
