<template>
  <section class="cube-wrapper">
    <ul class="cube-inner">
      <li class="front"></li>
      <li class="back"></li>
      <li class="right"></li>
      <li class="left"></li>
      <li class="top"></li>
      <li class="bottom"></li>
    </ul>
    <ul class="cube">
      <li class="front"></li>
      <li class="back"></li>
      <li class="right"></li>
      <li class="left"></li>
      <li class="top"></li>
      <li class="bottom"></li>
      <li class="floor"></li>
    </ul>
  </section>
</template>

<script>
  export default {}
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  @spin-speed: 2s;

  .cube-wrapper {
    width: 100%;
    position: relative;
    transform: scale(.25);
    height: 50px;
    z-index: -1;

    .cube, .cube li {
      position: absolute;
      display: block
    }

    .cube {
      width: 100%;
      height: 100%;
      padding: 0;
      transform-origin: 50px 50px;
      transform: rotateX(-33.5deg) rotateY(45deg);
      transform-style: preserve-3d;
      animation: slow-spin @spin-speed linear infinite;
      margin: -50px 0 0 -50px;
      top: 50%;
      left: 50%;

      li {
        width: 75pt;
        height: 75pt;

        &:after {
          content: "";
          display: block;
          position: absolute;
          width: 75pt;
          height: 75pt;
          backface-visibility: hidden;
          background-color: fade(@gray, 50%);
        }
      }

      .back, .front, .left, .right, .top {
        background: radial-gradient(transparent 30%, fade(darken(@gray, 30%), 50%) 100%)
      }

      .front {
        transform: translateZ(50px)
      }

      .back {
        transform: rotateX(-180deg) translateZ(50px)
      }

      .right {
        transform: rotateY(90deg) translateZ(50px)
      }

      .left {
        transform: rotateY(-90deg) translateZ(50px)
      }

      .top {
        transform: rotateX(90deg) translateZ(50px);

        &:after {
          background-color: fade(@gray, 50%)
        }
      }

      .bottom {
        transform: rotateX(-90deg) translateZ(50px)
      }

      .floor {
        box-shadow: -300px 0 50px rgba(0, 0, 0, .3);
        backface-visibility: visible;
        width: 110px;
        height: 110px;
        left: 295px;
        background-color: transparent;
        transform: rotateX(-90deg) translateZ(60px);

        &:after {
          display: none
        }
      }
    }

    .cube-inner, .cube-inner li {
      position: absolute;
      display: block
    }

    .cube-inner {
      width: 100%;
      height: 100%;
      padding: 0;
      top: 50%;
      left: 50%;
      transform-origin: 25px 25px;
      margin: -25px 0 0 -25px;
      transform: rotateX(-33.5deg) rotateY(45deg);
      transform-style: preserve-3d;
      animation: fast-spin @spin-speed linear infinite;

      li {
        width: 50px;
        height: 50px;

        &:after {
          content: "";
          display: block;
          position: absolute;
          width: 50px;
          height: 50px;
          backface-visibility: hidden;
          background-color: fade(darken(@gray, 70%), 50%);
        }
      }

      .back, .front, .left, .right, .top {
        background: radial-gradient(transparent 30%, fade(darken(@gray, 100%), 50%) 100%)
      }

      .front {
        transform: translateZ(25px)
      }

      .back {
        transform: rotateX(-180deg) translateZ(25px)
      }

      .right {
        transform: rotateY(90deg) translateZ(25px)
      }

      .left {
        transform: rotateY(-90deg) translateZ(25px)
      }

      .top {
        transform: rotateX(90deg) translateZ(25px);

        &:after {
          background-color: fade(darken(@gray, 70%), 50%)
        }
      }

      .bottom {
        transform: rotateX(-90deg) translateZ(25px)
      }
    }
  }

  @keyframes slow-spin {
    from {
      transform: rotateX(-33.5deg) rotateY(45deg)
    }

    to {
      transform: rotateX(-33.5deg) rotateY(225deg)
    }
  }

  @keyframes fast-spin {
    from {
      transform: rotateX(-33.5deg) rotateY(45deg)
    }

    to {
      transform: rotateX(-33.5deg) rotateY(-315deg)
    }
  }
</style>
