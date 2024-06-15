<script>
    import { onMount } from 'svelte'

    let loading = '⣾⣽⣻⢿⡿⣟⣯⣷⠁⠂⠄⡀⢀⠠⠐⠈', tick = 0, loadingElement

    onMount(() => {
        animate()
    })

    function animate() {
		tick = (tick + 1) % loading.length;
		if (loadingElement) {
			loadingElement.innerHTML = loading[tick]
            setTimeout(animate, 100)
		}
        
	}
</script>

<div bind:this={loadingElement}></div>
