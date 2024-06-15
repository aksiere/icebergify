<script>
	let { data } = $props()
	let { is_logged } = data
</script>

<div style='display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;'>
	{#if is_logged}
		<a href='/icebergify'>ICEBERGIFY</a>
		<form method='post' action='?/signOut'>
			<button type='submit' class='danger_color'>SIGN OUT</button>
		</form>
	{:else}
		<form method='post' action='?/signIn'>
			<button type='submit' class='spotify_color'>CONTINUE WITH SPOTIFY</button>
		</form>
	{/if}
</div>
