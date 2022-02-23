// thanks to David A

var prefixes = ['webkit', 'moz', 'ms', '']
function prefixedEvent(element, type, callback) {
  for (var p = 0; p < prefixes.length; p++) {
    if (!prefixes[p]) type = type.toLowerCase()
    element.addEventListener(prefixes[p] + type, callback, false)
  }
}

function transform($e, x, y, scale, rotation, percent) {
  x = x || 0
  y = y || 0
  scale = scale || 1
  var unit = percent ? '%' : 'px'
  rotation = rotation || 0

  var transfromString =
    'translate(' +
    x +
    unit +
    ', ' +
    y +
    unit +
    ') ' +
    'scale(' +
    scale +
    ') ' +
    'rotate(' +
    rotation +
    'deg)'

  $e.style.webkitTransform = transfromString
  $e.style.MozTransform = transfromString
  $e.style.transform = transfromString
}

function createParticle(x, y, scale) {
  var $particle = document.createElement('i')
  var $sparcle = document.createElement('i')

  $particle.className = 'particle'
  $sparcle.className = 'sparcle'

  transform($particle, x, y, scale)
  $particle.appendChild($sparcle)

  return $particle
}

function explode($container) {
  var particles = []

  particles.push(createParticle(0, 0, 1))
  particles.push(createParticle(50, -15, 0.4))
  particles.push(createParticle(50, -105, 0.2))
  particles.push(createParticle(-10, -60, 0.8))
  particles.push(createParticle(-10, 60, 0.4))
  particles.push(createParticle(-50, -60, 0.2))
  particles.push(createParticle(-50, -15, 0.75))
  particles.push(createParticle(-100, -15, 0.4))
  particles.push(createParticle(-100, -15, 0.2))
  particles.push(createParticle(-100, -115, 0.2))
  particles.push(createParticle(80, -15, 0.1))

  particles.forEach(function (particle) {
    $container.appendChild(particle)
    prefixedEvent(particle, 'AnimationEnd', function () {
      var self = this
      setTimeout(function () {
        requestAnimationFrame(function () {
          $container.removeChild(self)
        })
      }, 100)
    })
  })
}

function exolpodeGroup(x, y, trans) {
  var $container = document.createElement('div')

  $container.className = 'container'
  $container.style.top = y + 'px'
  $container.style.left = x + 'px'

  transform($container, trans.x, trans.y, trans.scale, trans.r, true)

  explode($container)
  return $container
}

export default function sparcle(event) {
  var explosions = []

  explosions.push(
    exolpodeGroup(event.pageX, event.pageY, { scale: 1, x: -50, y: -50, r: 0 })
  )
  explosions.push(
    exolpodeGroup(event.pageX, event.pageY, {
      scale: 0.5,
      x: -30,
      y: -50,
      r: 180
    })
  )
  explosions.push(
    exolpodeGroup(event.pageX, event.pageY, {
      scale: 0.5,
      x: -50,
      y: -20,
      r: -90
    })
  )

  requestAnimationFrame(function () {
    explosions.forEach(function (boum, i) {
      setTimeout(function () {
        document.body.appendChild(boum)
      }, i * 100)
    })
  })
}
