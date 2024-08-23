<script>
	import { cubicOut } from 'svelte/easing'
	import { scale } from 'svelte/transition'

	let {
		open = false,
		querySelector = '[data-wrapper]',
		scaleBackground = false,
		direction = 'bottom',
		threshold = 50,
		opacity: dim_opacity = 60,
		transition_duration = 400,
		transition_easing = `cubic-bezier(.32, .72, 0, 1)`,
		onclose = () => {},
		children,
		...stuff
	} = $props()

	let drawer = $state()
	let dim = $state()

	const f1 = {
		'top': (a, b) => (b.y - a.y) * -1,
		'bottom': (a, b) => (a.y - b.y),
		'left': (a, b) => (b.x - a.x) * -1,
		'right': (a, b) => (a.x - b.x)
	}

	const f2 = {
		'top': (a, b) => (b.y - a.y),
		'bottom': (a, b) => (a.y - b.y),
		'left': (a, b) => (b.x - a.x),
		'right': (a, b) => (a.x - b.x)
	}

	const f3 = {
		'top': (e) => ({ d: 'Y', p: 'height', o: e.offsetHeight, v: drawer_height }),
		'bottom': (e) => ({ d: 'Y', p: 'height', o: e.offsetHeight, v: drawer_height }),
		'left': (e) => ({ d: 'X', p: 'width', o: e.offsetWidth, v: drawer_width }),
		'right': (e) => ({ d: 'X', p: 'width', o: e.offsetWidth, v: drawer_width }),
	}
	
	const close = () => {
		if (open) {
			open = false
			onclose()
		}
	}
	
	const onkeydown = (e) => {
		switch (e.code) {
			case 'Escape':
				close()
				break
			default:
				break
		}
	}

	const onload = () => {
		t2()
	}
	
	let is_down = $state(false)
	let is_down_pos = $state({})
	let is_up_t = $state(0)
	let drawer_height = $state(0)
	let drawer_width = $state(0)

	const onpointerdown = (e) => {
		const hovered_elements = document.elementsFromPoint(e.x, e.y)

		if (!hovered_elements.includes(drawer)) {
			close()
		} else {
			is_down = true
			is_down_pos = { x: e.x, y: e.y }
			is_up_t = 0

			drawer_height = drawer.offsetHeight
			drawer_width = drawer.offsetWidth

			t1()
		}
	}

	const onpointerup = (e) => {
		if (!is_down) return

		t2()
		t3()
		t4()
		t5()

		if (is_up_t * 100 > threshold) {
			close()
		}

		is_down = false
		is_down_pos = {}
		is_up_t = 0
	}

	const onpointermove = (e) => {
		if (is_down) {
			const t = f2[direction](e, is_down_pos) / (f3[direction](drawer).o)

			if (t < 0) {
				// console.log(1)
				t6(Math.min(Math.abs(t) * 40, 60))
			} else {
				// console.log(2)
				t3(f3[direction](drawer).d, f1[direction](e, is_down_pos), 'px')
				t4((1 - t) * 16, (1 - t) * 10, (1 - t) * dim_opacity)
			}

			is_up_t = t
		}
	}

	function t1() {
		drawer.style.transition = `none`
		if (scaleBackground) {
			document.querySelector(querySelector).style.transition = `none`
		}
		dim.style.transition = `none`
	}

	function t2() {
		drawer.style.transition = `transform ${transition_duration}ms ${transition_easing}, height ${transition_duration}ms ${transition_easing}, width ${transition_duration}ms ${transition_easing}`
		if (scaleBackground) {
			document.querySelector(querySelector).style.transition = `transform ${transition_duration}ms ${transition_easing}, border-radius ${transition_duration}ms ${transition_easing}`
		}
		dim.style.transition = `filter ${transition_duration}ms ${transition_easing}`
	}

	function t3(direction = 'Y', value = 0, unit = '%') {
		drawer.style.transform = `translate${direction}(${value}${unit})`
	}

	function t4(v1 = 16, v2 = 10, v3 = dim_opacity) {
		if (scaleBackground) {
			document.querySelector(querySelector).style.transform = `scaleX(${100 - v1 / (window.innerWidth / 200)}%) scaleY(${100 - v1 / (window.innerHeight / 200)}%)`
			document.querySelector(querySelector).style.borderRadius = `${Math.round(v2)}px`
		}
		dim.style.filter = `opacity(${v3}%)`
	}

	function t5() {
		drawer.style[f3[direction](drawer).p] = `${f3[direction](drawer).v}px`
		drawer_height = 0
		drawer_width = 0
	}

	function t6(add) {
		drawer.style[f3[direction](drawer).p] = `${f3[direction](drawer).v + add}px`
	}

	// 

	function split_css_unit(value) {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/)
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px']
	}

	function fly(node, { delay = 0, duration = transition_duration, easing = cubicOut, x = 0, y = 0, xy = 0, opacity = 0 } = {}) {
		switch (direction) {
			case 'top':
				y = `-${xy}`
				break
			case 'bottom':
				y = `${xy}`
				break
			case 'left':
				x = `-${xy}`
				break
			case 'right':
				x = `${xy}`
				break
		}

		const style = getComputedStyle(node)
		const target_opacity = +style.opacity
		const transform = style.transform === 'none' ? '' : style.transform
		const od = target_opacity * (1 - opacity)
		const [x_value, x_unit] = split_css_unit(x)
		const [y_value, y_unit] = split_css_unit(y)

		return {
			delay,
			duration,
			easing,
			css: (t, u) => {
				t4(t * 16, t * 10, t * dim_opacity)
				return `transform: ${transform} translate(${(1 - t) * x_value}${x_unit}, ${(1 - t) * y_value}${y_unit});`
			}
		}
	}
</script>

<svelte:window {onkeydown} {onpointerdown} {onpointerup} {onpointermove} />

{#if open}
	<div bind:this={dim} class='dim' style='--transition-type: {transition_easing}; --transition-duration: {transition_duration}ms'></div>
	<div
		bind:this={drawer}
		use:onload
		class:drawer={true}
		transition:fly={{ xy: '100%', duration: transition_duration, opacity: 1 }}
		class:top={direction === 'top'}
		class:bottom={direction === 'bottom'}
		class:left={direction === 'left'}
		class:right={direction === 'right'}
		{...stuff}
	>
		{@render children()}
	</div>
{/if}

<style>
	.dim {
		position: fixed;
		width: 100%;
		height: 100%;
		background: black;
		filter: opacity(0%);
		top: 0;
		left: 0;
		z-index: 100;
		/* pointer-events: visible; */
	}

	.drawer {
		position: fixed;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
		transition: transform .5s cubic-bezier(.32, .72, 0, 1);
		z-index: 101;

		&.top {
			width: 100%;
			left: 0;
			top: 0;
		}

		&.bottom {
			width: 100%;
			left: 0;
			bottom: 0;
		}

		&.left {
			height: 100%;
			left: 0;
			bottom: 0;
		}

		&.right {
			height: 100%;
			right: 0;
			bottom: 0;
		}

		cursor: grab;
		&:active {
			cursor: grabbing;
		}
	}
</style>
