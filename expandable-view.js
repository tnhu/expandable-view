function scroll(element, increment, duration) {
  element.scrollLeft += increment
}

function update(view, forceUpdate) {
  if (!view) {
    return
  }

  var overflow = 'overflow'
  var wrapper = view && view.firstChild
  var content = wrapper && wrapper.firstChild
  var scrollIncrement = parseInt(view.getAttribute('scroll-increment')) || 800
  var scrollDuration = parseInt(view.getAttribute('scroll-duration')) || 1200
  var lastChild = content && content.lastChild

  // Reset content's width so content's children have a chance to expand themselves
  if (forceUpdate) {
    content.style.width = '99999px';
  }

  if (lastChild) {
    var childrenWidth = lastChild.offsetLeft + lastChild.offsetWidth
    var viewWidth = parseInt(getComputedStyle(view).width)
    var newContentWidth = childrenWidth + 'px'

    if (forceUpdate || content.expandableWidth !== newContentWidth) { // only update if different or forceUpdate is set to true
      content.expandableWidth = content.style.width = newContentWidth
    }

    if (viewWidth < childrenWidth) {
      view.setAttribute(overflow, true)
    } else {
      view.removeAttribute(overflow)
    }
  }

  var prev = 'prev'
  var next = 'next'

  //
  // Handle scrolling using mouse/track pad
  //
  var scrollEventHandler = function() {
    // These values need to be calculated again for dynamic children
    var scrollLeft = wrapper.scrollLeft
    var lastChild = content && content.lastChild
    var viewWidth = parseInt(getComputedStyle(view).width)

    if (scrollLeft > 0) {
      if (!view.hasAttribute(prev)) {
        view.setAttribute(prev, true)
      }
    } else {
      if (view.hasAttribute(prev)) {
        view.removeAttribute(prev)
      }
    }

    var childrenWidth = lastChild && (lastChild.offsetLeft + lastChild.offsetWidth) || 0

    if (scrollLeft + viewWidth < childrenWidth) {
      if (!view.hasAttribute(next)) {
        view.setAttribute(next, true)
      }
    } else {
      if (view.hasAttribute(next)) {
        view.removeAttribute(next)
      }
    }
  }

  if (!view.isEventListenersAdded) {
    view.isEventListenersAdded = true

    // TODO: ':scope' is not working in IE/Edge?
    var prevButton = view.querySelector(':scope > button:first-of-type')
    var nextButton = view.querySelector(':scope > button:last-of-type')

    var prevEventHandler = function() { scroll(wrapper, -scrollIncrement, scrollDuration) }
    var nextEventHandler = function() { scroll(wrapper, scrollIncrement, scrollDuration) }

    wrapper.addEventListener('scroll', scrollEventHandler)

    // Trigger handle for the first time to render prev/next buttons properly
    scrollEventHandler()

    //
    // prev/next buttons
    //
    prevButton.addEventListener('click', prevEventHandler)
    nextButton.addEventListener('click', nextEventHandler)

    view.cleanup = function() {
      prevButton.removeEventListener('click', prevEventHandler)
      nextButton.removeEventListener('click', nextEventHandler)
      wrapper.removeEventListener('scroll', scrollEventHandler)

      delete view.isEventListenersAdded
    }
  } else {
    scrollEventHandler() // trigger scroll event to re-calculate prev/next buttons's visibility
  }
}

function destroy(view) {
  view && view.cleanup && view.cleanup()
}

module.exports = {
  update: update,
  destroy: destroy
}

// TODO:
// - animation when scrolling (prev, next buttons clicked)
// - :scope selector might not work under Edge
// - update when window.resize?