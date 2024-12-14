export default {
	async fetch(req): Promise<Response> {
		if (new URL(req.url).pathname === '/ping') {
			return new Response('Pong!');
		} else {
			return new Response(null, { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
