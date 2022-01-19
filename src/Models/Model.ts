( () =>
{
	class Model implements LuminusModel
	{
		public loaded?: boolean;
		public complete?: boolean;
		public afterload?: () => unknown;

		public load()
		{
			this.loaded = false;
			this.complete = undefined;

			return Promise.resolve().then( () =>
			{
				return this.onload();
			} ).then( () =>
			{
				this.loaded = true;
				if ( this.afterload ) { this.afterload(); }
			});
		}

		public prepare( support: LuminusSupport )
		{
			this.complete = false;

			return this.onprepare( support ).then( () => { this.complete = true; });
		}

		public render( support: LuminusSupport )
		{
			if ( this.complete )
			{
				return this.onrender( support );
			}

			if ( this.loaded === undefined )
			{
				this.load().then( () => { this.prepare( support ); } ).then( () => { this.render( support ); } );
			}

			if ( this.complete === undefined )
			{
				this.prepare( support ).then( () => { this.render( support ); } );
			}
		}

		onload() { return Promise.resolve(); }
		onprepare( support: LuminusSupport ) { return Promise.resolve(); }
		onrender( support: LuminusSupport ) {}
	}
	Luminus.models.model = Model;
} )();
