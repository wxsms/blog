export function getAnchors() {
  let anchors = []
  if (document) {
    let attr = '[role="anchor"]'
    // let headings = document.querySelectorAll(`h1${attr},h2${attr},h3${attr},h4${attr},h5${attr},h6${attr}`)
    let headings = document.querySelectorAll(`h2${attr},h3${attr}`)
    for (let i = 0; i < headings.length; i++) {
      let h = headings[i]
      let a = h.querySelector(`a${attr}`)
      let t = {
        level: parseInt(h.tagName.substr(1, 1)),
        href: a.getAttribute('name'),
        label: a.innerHTML,
        items: []
      }
      if (t.level === 2) {
        anchors.push(t)
      } else if (anchors.length) {
        anchors[anchors.length - 1].items.push(t)
      }
    }
  }
  return anchors
}
