<template functional>
  <section>
    <div class="scroll-touch">
      <p>
        This paragraph has momentum scrolling
      </p>
    </div>
    <div class="scroll-auto">
      <p>
        This paragraph does not.
      </p>
    </div>
  </section>
</template>

<style scoped>
  div {
    width: 100%;
    overflow: auto;
  }

  p {
    width: 200%;
    background: #f5f9fa;
    border: 2px solid #eaf2f4;
    padding: 10px;
  }

  .scroll-touch {
    -webkit-overflow-scrolling: touch; /* Lets it scroll lazy */
  }

  .scroll-auto {
    -webkit-overflow-scrolling: auto; /* Stops scrolling immediately */
  }
</style>