using Audible.Interfaces.Model;
using Audible.Model;

using Ninject.Modules;

namespace Audible.Service.Module
{
    public class AudibleModelInjector : NinjectModule
    {
        #region Overrides of NinjectModule

        public override void Load()
        {
            this.Bind<INoteModel>().To<NoteModel>().InSingletonScope();

            this.Bind<IPiModel>().To<PiModel>().InSingletonScope();
        }

        #endregion
    }
}