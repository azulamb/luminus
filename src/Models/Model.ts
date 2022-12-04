(() => {
	Luminus.models.model = class Model implements LuminusModel<unknown> {
		public loaded?: boolean;
		public complete?: boolean;
		public afterload?: () => unknown;

		public load<T>(p?: Promise<T>) {
			this.loaded = false;
			this.complete = undefined;

			return (p || Promise.resolve(<any> null)).then((result) => {
				return this.onload(result);
			}).then(() => {
				this.loaded = true;
				if (this.afterload) {
					this.afterload();
				}
			});
		}

		public prepare(world: LuminusWorld) {
			if (!this.loaded) {
				return Promise.resolve();
			}
			this.complete = false;

			return this.onprepare(world).then(() => {
				this.complete = true;
			});
		}

		public render(world: LuminusWorld) {
			if (this.complete) {
				return this.onrender(world);
			}

			/*if ( this.loaded === undefined )
			{
				this.load().then( () => { this.prepare( support ); } ).then( () => { this.render( support ); } );
			}*/

			if (this.loaded === true && this.complete === undefined) {
				this.prepare(world).then(() => {
					this.render(world);
				});
			}
		}

		public onload(arg: any) {
			return Promise.resolve();
		}

		public onprepare(world: LuminusWorld) {
			return Promise.resolve();
		}

		public onrender(world: LuminusWorld) {}

		public collisionDetection(cd: CollisionDetection): number {
			return Infinity;
		}
	};
})();
