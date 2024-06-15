<script>
	let { data } = $props()
	let { is_logged } = data

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
        let result = (await (await fetch(`${$page.url.origin}/api/top?type=${current_type}&time_range=${current_time_range}&limit=${current_limit}`)).json())

        if (result.error) {
            error = result.error
        } else {
            items = result.items
        }
    }

    let canvas, image, link = $state('')

    const CANVAS_WIDTH = 500
    const CANVAS_HEIGHT = 708
    
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

        link = canvas.toDataURL('image/png')
    }

    const onchange = async () => {
        items = []
        items = (await (await fetch(`${$page.url.origin}/api/top?type=${current_type}&time_range=${current_time_range}&limit=${current_limit}`)).json()).items
    }
</script>

<div style='display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;'>
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
			{error.message.toUpperCase()}
		{:else}
			<div style='display: none; flex-direction: column; width: 100%; max-width: {CANVAS_WIDTH}px;'>
				<form style='display: flex; gap: 1rem;'>
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
				</form><br>

				<span style='text-align: justify;'>This is your iceberg. It interprets the popularity of <mark>{current_type}</mark> that you have listened to most often in the last <mark>{TIME_RANGES[current_time_range]}</mark>.</span><br>
				<canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} bind:this={canvas}></canvas>
			</div>
		{/if}
	{:else}
		<form method='post' action='?/signIn'>
			<button type='submit' class='spotify_color'>CONTINUE WITH SPOTIFY</button>
		</form>
	{/if}
</div>

<style>
    canvas {
        object-fit: contain;
    }
</style>
