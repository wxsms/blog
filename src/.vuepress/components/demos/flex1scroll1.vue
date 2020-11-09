<template>
  <section class="wrapper">
    <div class="header">header</div>
    <div class="body">
      <p>Lorem ipsum dolor sit amet consectetur adipiscing elit facilisi, vestibulum accumsan diam iaculis fusce praesent arcu, pretium vulputate sed ultrices cum posuere cras. Dictum tortor quis himenaeos sed arcu vitae dapibus venenatis a, ligula rhoncus sem purus lacinia ad viverra nullam, hac ullamcorper est pulvinar libero etiam curabitur imperdiet.</p>
      <p>Luctus auctor lacinia ornare nam nulla vestibulum fames, velit aenean libero sapien neque nibh ante platea, fringilla justo venenatis cras nullam quisque. Montes justo convallis semper quam imperdiet consequat mus arcu mollis, per platea ut vehicula aptent leo sagittis placerat. Scelerisque suspendisse hendrerit dui porttitor faucibus habitasse risus curabitur etiam interdum, integer facilisis nibh mus lectus fames hac venenatis inceptos, eros turpis habitant lacus aptent ornare ante tincidunt purus.</p>
      <p>Lorem ipsum dolor sit amet consectetur adipiscing elit facilisi, vestibulum accumsan diam iaculis fusce praesent arcu, pretium vulputate sed ultrices cum posuere cras. Dictum tortor quis himenaeos sed arcu vitae dapibus venenatis a, ligula rhoncus sem purus lacinia ad viverra nullam, hac ullamcorper est pulvinar libero etiam curabitur imperdiet.</p>
    </div>
    <div class="footer">footer</div>
  </section>
</template>

<style scoped>
.wrapper {
  background: black;
  height: 300px;
  display: flex;
  flex-direction: column;
  color: white;
}

.header {
  background: red;
  border-bottom: 1px solid white;
}

.body {
  background: blue;
  flex: 1;
  overflow: auto;
}

.footer {
  border-bottom: 1px solid white;
  background: green;
}
</style>