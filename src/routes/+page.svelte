<script>
	let { data } = $props()
	let { is_logged } = data

	import Drawer from '$lib/components/Drawer.svelte'

    import { page } from '$app/stores'
    import Loading from '$lib/components/Loading.svelte'

    let current_limit = $state($page.url.searchParams.get('limit') || 50)
    let current_time_range = $state($page.url.searchParams.get('time_range') || 'short_term')
    let current_type = $state($page.url.searchParams.get('type') || 'artists')

    const TIME_RANGES = {
        short_term: '~4\u00A0weeks',
        medium_term: '~6\u00A0months',
        long_term: '~1\u00A0year',
    }

    let error = $state(undefined)
    let items = $state([])

    const get_artists = async () => {
        await new Promise(r => setTimeout(r, 500))
        let result = await (await fetch(`${$page.url.origin}/api/top?type=${current_type}&time_range=${current_time_range}&limit=${current_limit}`)).json()
		console.log(result)

        if (result.error || result.message) {
            if (result.error) {
                error = result.error
            } else {
                if (result.message === 'Internal Error') {
                    error = { message: `Waiting to hear back from Spotify about my app :(<br><br>So right now the app is in whitelist mode. If you want access, <a target='_blank' href='https://t.me/shrptn'>contact me</a>.` }
                } else {
                    error = { message: result.message }
                }
            }
        } else {
            items = result.items
		}
    }

    let canvas, image, link = $state('')

    const CANVAS_WIDTH = 500
    const CANVAS_HEIGHT = 708 + 21 * 3
    
    const GAP = 10
    const FONT_SIZE = 16
    const WORD_SPACES = 10
    const ROWS_IN_ROW = 4

    const AVAILABLE_WIDTH = 405
    const ICEBERG_ROWS = 8

    const ICEBERG_ROWS_HEIGHTS = [70, 70, 98, 82, 88, 68, 84, 84]
    const ICEBERG_ROWS_YS = [0, 84, 172, 270, 360, 450, 532, 620]

    const start = async () => {
        canvas.parentNode.style.display = 'flex'
    
        let ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0)
            ctx.font = `${FONT_SIZE}px monospace`
		    ctx.fillStyle = 'white'
            ctx.textAlign = 'center'

        const new_texts = [ [], [], [], [], [], [], [], [] ]

		for (let i = 0; i < items.length; i++) {
			if (items[i].popularity <= 12.5) {
				new_texts[7].push(items[i].name)
			} else if (items[i].popularity <= 25) {
				new_texts[6].push(items[i].name)
			} else if (items[i].popularity <= 37.5) {
				new_texts[5].push(items[i].name)
			} else if (items[i].popularity <= 50) {
				new_texts[4].push(items[i].name)
			} else if (items[i].popularity <= 62.5) {
				new_texts[3].push(items[i].name)
			} else if (items[i].popularity <= 75) {
				new_texts[2].push(items[i].name)
			} else if (items[i].popularity <= 87.5) {
				new_texts[1].push(items[i].name)
			} else if (items[i].popularity <= 100) {
				new_texts[0].push(items[i].name)
			}
		}

        for (let k = 0; k < new_texts.length; k++) {
            const texts = new_texts[k]

            let widths = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]
            let xs = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]
            let indexes = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]

            for (let i = 0; i < texts.length; i++) {
                const text = texts[i]
                const text_width = ctx.measureText(text).width

                if (text_width < CANVAS_WIDTH) {
                    for (let j = 0; j < widths.length; j++) {
                        const row_width = widths[j].reduce((a, b) => a + b, 0)
                        
                        if (GAP + row_width + text_width + GAP <= AVAILABLE_WIDTH) {
                            widths[j].push(GAP * WORD_SPACES + text_width)
                            xs[j].push(GAP * WORD_SPACES + row_width)
                            indexes[j].push(i)
                            break
                        }
                    }
                }
            }

            widths = widths.filter(r => r.length > 0).splice(0, ROWS_IN_ROW)
            xs = xs.filter(r => r.length > 0).splice(0, ROWS_IN_ROW)
            indexes = indexes.filter(r => r.length > 0).splice(0, ROWS_IN_ROW)

            let rows = indexes.map((r, i) => r.map((t, i) => texts.at(t)).join(' '.repeat(WORD_SPACES)))

            for (let i = 0; i < rows.length; i++) {
                const text = rows[i]
                ctx.fillText(text, AVAILABLE_WIDTH / 2, ICEBERG_ROWS_YS[k] + GAP * 2 + i * ((ICEBERG_ROWS_HEIGHTS[k] / ICEBERG_ROWS) + GAP) + (4 - rows.length) * ((ICEBERG_ROWS_HEIGHTS[k] / ICEBERG_ROWS)))
            }
        }

		const c0 = 708
		const c1 = 21
		const c2 = 18

		ctx.fillStyle = '#1db954'
		ctx.fillRect(0, c0 + c1 * 0, CANVAS_WIDTH, c1)
		ctx.fillRect(0, c0 + c1 * 1, CANVAS_WIDTH, c1)
		ctx.fillRect(0, c0 + c1 * 2, CANVAS_WIDTH, c1)
		
		ctx.textAlign = 'center'
		ctx.fillStyle = 'black'
		ctx.fillText(`That's my iceberg. It interprets the popularity of the`, CANVAS_WIDTH / 2, c0 + c2 * 1)
		ctx.fillText(`${current_type} I've listened to the most often in the last`, CANVAS_WIDTH / 2, c0 + c2 * 2)
		ctx.fillText(`${TIME_RANGES[current_time_range]}. Check yours at icebergify.vercel.app!`, CANVAS_WIDTH / 2, c0 + c2 * 3)

		link = canvas.toDataURL('image/png')
    }

    const onchange = async () => {
        items = []
        items = (await (await fetch(`${$page.url.origin}/api/top?type=${current_type}&time_range=${current_time_range}&limit=${current_limit}`)).json()).items
		console.log(items)
		
    }

	let show_drawer = $state(false)
</script>

<Drawer open={show_drawer} onclose={() => show_drawer = false} opacity={95} style='background: var(--background); height: 50vh; overflow-y: scroll; overscroll-behavior-y: contain;' scaleBackground direction='bottom'>
	{#if items}
		<div style='padding-inline: 2rem; padding-block: 1.5rem;'>
			<p style='margin-top: 0;'>Referenced content:</p>
			{#each items as item}
				<div style='display: flex; align-items: center; gap: .25rem;'>
					<img src='./spotify_icon.svg' alt={item.name} height={16} width={16} style='object-fit: cover; margin-top: 3px'>
					<img src={item.album?.images.at(-1).url || item.images.at(-1).url} alt={item.name} height={16} width={16} style='object-fit: cover; margin-top: 3px'>
					<a href={item.uri} alt={item.name}>{item.name}</a>
					<span style='color: #222;'>{item.uri}</span>
				</div>
			{/each}
			<!-- {JSON.stringify(items.map(i => ({ id: i.id, name: i.name, external_urls: i.external_urls })), null, 2)} -->
		</div>
	{/if}
</Drawer>

<div data-wrapper style='display: flex; flex-direction: column; width: 100%; height: 100dvh; align-items: center; justify-content: center;'>
	{#if is_logged}
		<div style='display:none;'>
			<!-- svelte-ignore a11y_missing_attribute -->
			<img id='source' src='iceberg.png' width='500' height='708' bind:this={image} />
		</div>

		{#await get_artists()}
			<Loading />
		{:then}
			{#await start()}{/await}
		{/await}

		{#if error}
			<div style='text-align: center;'>
				{@html error.message.toUpperCase()}
			</div>
		{:else}
			<div style='display: none; flex-direction: column; width: 100%; max-width: {CANVAS_WIDTH}px;'>
				<form style='display: flex; gap: 1rem; margin-bottom: 1rem;'>
					<div class='select-wrapper'>
						<select name='type' onchange={(e) => { current_type = e.target.value; onchange() }}>
							<option value='artists' selected>artists</option>
							<option value='tracks'>tracks</option>
						</select>
					</div>

					<div class='select-wrapper'>
						<select name='time_range' onchange={(e) => { current_time_range = e.target.value; onchange() }}>
							{#each Object.keys(TIME_RANGES) as time_range}
								<option value={time_range} selected={time_range === 'short_term'}>{TIME_RANGES[time_range]}</option>
							{/each}
						</select>
					</div>

					<a style='margin-left: auto;' target='_blank' href={link} download='icebergify__{current_type}__{current_time_range}.png'>DOWNLOAD</a>
				</form>

				<!-- <span style='text-align: justify;'>This is your iceberg. It interprets the popularity of <mark>{current_type}</mark> that you have listened to most often in the last <mark>{TIME_RANGES[current_time_range]}</mark>.</span><br> -->
				<canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} bind:this={canvas}></canvas>
			</div>
		{/if}
	{:else}
        <form method='post' action='?/signIn'>
            <br><br>
            <button type='submit' class='spotify_color'>CONTINUE WITH SPOTIFY</button>
        </form>

		<p>*by signing in, you accept the <a href='/eua'>user agreement</a> and <a href='/pp'>privacy policy</a></p>
	{/if}
</div>

{#if is_logged}
	<div style='display: flex; gap: .5rem; flex-direction: column; width: 100%; height: 300px; align-items: center; justify-content: center; -webkit-user-select: none;'>
		<div style='display: flex; gap: .5rem; align-items: center; margin-bottom: 6px;'>
			<span style='color: #555;'>developed by</span>
			<a target='_blank' href='https://t.me/shrptn'>@shrptn</a>
		</div>

		<div style='display: flex; gap: .5rem; align-items: center;'>
			<span style='color: #555; margin-bottom: 6px;'>data provided by</span>
			<enhanced:img src='./spotify.png?w=100' alt='Spotify' />
		</div>

		<div style='display: flex; gap: .5rem; align-items: center; margin-bottom: 6px; cursor: pointer;'>
			<span style='color: #555;' ></span>
			<a onclick={() => show_drawer = true}>show metadata</a>
		</div>
	</div>
{/if}

<style>
    canvas {
        object-fit: contain;
    }

	.show_metadata_1:hover .show_metadata_2 {
		display: block;
	}

	.show_metadata_2 {
		display: none;
		margin-left: 1rem;
	}
</style>
