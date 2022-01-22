( () =>
{
	class Model implements LuminusModel<unknown>
	{
		public loaded?: boolean;
		public complete?: boolean;
		public afterload?: () => unknown;

		public load<T>( p?: Promise<T> )
		{
			this.loaded = false;
			this.complete = undefined;

			return ( p || Promise.resolve( <any>null ) ).then( ( result ) =>
			{
				return this.onload( result );
			} ).then( () =>
			{
				this.loaded = true;
				if ( this.afterload ) { this.afterload(); }
			});
		}

		public prepare( support: LuminusSupport )
		{
			if ( !this.loaded ) { return Promise.resolve(); }
			this.complete = false;

			return this.onprepare( support ).then( () => { this.complete = true; } );
		}

		public render( support: LuminusSupport )
		{
			if ( this.complete )
			{
				return this.onrender( support );
			}

			/*if ( this.loaded === undefined )
			{
				this.load().then( () => { this.prepare( support ); } ).then( () => { this.render( support ); } );
			}*/

			if ( this.loaded === true && this.complete === undefined )
			{
				this.prepare( support ).then( () => { this.render( support ); } );
			}
		}

		onload( arg: any ) { return Promise.resolve(); }
		onprepare( support: LuminusSupport ) { return Promise.resolve(); }
		onrender( support: LuminusSupport ) {}
	}
	Luminus.models.model = Model;
} )();
