const stopEvent = function(e) {

	if (typeof e.stopPropagation === 'function') e.stopPropagation()
	if (typeof e.preventDefault === 'function')  e.preventDefault()

}

const validate = function(opts = {}) {

	opts = Object.assign({}, opts)

	if (opts.closable!==false) opts.closable = true

	if (typeof opts.className === 'function') opts.className = opts.className()
	if (typeof opts.className !== 'string')   opts.className = null

	if (typeof opts.beforeShow !== 'function')  opts.beforeShow = () => {}
	if (typeof opts.afterShow !== 'function')   opts.afterShow = () => {}
	if (typeof opts.beforeClose !== 'function') opts.beforeClose = () => {}
	if (typeof opts.afterClose !== 'function')  opts.afterClose = () => {}

	if (typeof opts.beforeHTML === 'function') opts.beforeHTML = opts.beforeHTML()
	if (typeof opts.beforeHTML !== 'string')   opts.beforeHTML = ''

	if (typeof opts.afterHTML === 'function') opts.afterHTML = opts.afterHTML()
	if (typeof opts.afterHTML !== 'string')   opts.afterHTML = ''

	if (typeof opts.beforePlaceholder === 'function') opts.beforePlaceholder = opts.beforePlaceholder()
	if (typeof opts.beforePlaceholder !== 'string')   opts.beforePlaceholder = ''

	if (typeof opts.afterPlaceholder === 'function') opts.afterPlaceholder = opts.afterPlaceholder()
	if (typeof opts.afterPlaceholder !== 'string')   opts.afterPlaceholder = ''

	return opts

}

const containsIMG = function(elem) {

	const children = elem.children

	return (children.length===1 && children[0].tagName==='IMG' ? true : false)

}

export const visible = function(elem) {

	elem = elem || document.querySelector('.basicLightbox')

	return (elem!=null && elem.ownerDocument.body.contains(elem)===true ? true : false)

}

const render = function(html = '', opts) {

	const elem = document.createElement('div')

	// Add the default class
	elem.classList.add('basicLightbox')

	// Add a custom class when available
	if (opts.className!=null) elem.classList.add(opts.className)

	// Add lightbox content
	elem.innerHTML = `
		<div class="basicLightbox__close"></div>
		${ opts.beforePlaceholder }
		<div class="basicLightbox__placeholder">
			${ opts.beforeHTML }
			${ html }
			${ opts.afterHTML }
		</div>
		${ opts.afterPlaceholder }
	`

	// Check if placeholder contains only an image
	const img = containsIMG(elem.querySelector('.basicLightbox__placeholder'))

	// Add img class to lightbox when it only contains an image
	// This class is necessary to center the image properly
	if (img===true) elem.classList.add('basicLightbox--img')

	return elem

}

const show = function(elem, next) {

	// Append lightbox to DOM
	document.body.appendChild(elem)

	// Wait a while to ensure that the class change triggers the animation
	setTimeout(() => {
		requestAnimationFrame(() => {

			// Show lightbox
			elem.classList.add('basicLightbox--visible')

			// Continue with the callback
			return next()

		})
	}, 10)

}

const close = function(elem, next) {

	// Hide lightbox
	elem.classList.remove('basicLightbox--visible')

	setTimeout(() => {
		requestAnimationFrame(() => {

			// Don't continue to remove lightbox when element missing
			if (visible(elem)===false) return next()

			// Remove lightbox from DOM
			elem.parentElement.removeChild(elem)

			// Continue with the callback
			return next()

		})
	}, 410)

	return true

}

export const create = function(html, opts) {

	// Validate options
	opts = validate(opts)

	// Render the lightbox element
	const elem = render(html, opts)

	// Check if the lightbox is attached to the DOM
	const _visible = () => {

		return visible(elem)

	}

	// Show the lightbox
	const _show = (next) => {

		// Run beforeShow event
		// Stop execution when function returns false
		if (opts.beforeShow()===false) return false

		// Show the lightbox
		show(elem, () => {

			// Run afterShow event
			opts.afterShow()

			// Continue with the callback when available
			if (typeof next === 'function') return next()

		})

		return true

	}

	// Hide the lightbox
	const _close = (next) => {

		// Run beforeClose event
		// Stop execution when function returns false
		if (opts.beforeClose()===false) return false

		close(elem, () => {

			// Run afterClose event
			opts.afterClose()

			// Continue with the callback when available
			if (typeof next === 'function') return next()

		})

		return true

	}

	// Close lightbox when clicking the background
	if (opts.closable===true) elem.querySelector('.basicLightbox__close').onclick = function(e) {

		_close()
		stopEvent(e)

	}

	return {
		visible : _visible,
		show    : _show,
		close   : _close
	}

}

export const from = function(elem, opts) {

	const html = elem.outerHTML

	return create(html, opts)

}