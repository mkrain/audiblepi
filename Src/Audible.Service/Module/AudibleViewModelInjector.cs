using Audible.Interfaces.ViewModel;
using Audible.ViewModel;

using Ninject.Modules;

namespace Audible.Service.Module
{
    public class AudibleViewModelInjector : NinjectModule
    {
        #region Overrides of NinjectModule

        public override void Load()
        {
            this.Bind<INoteViewModel>().To<NoteViewModel>().InSingletonScope();
            this.Bind<IPiViewModel>().To<PiViewModel>().InSingletonScope();
            this.Bind<ISettingsViewmodel>().To<SettingsViewModel>().InSingletonScope();
            this.Bind<IInfoViewModel>().To<InfoViewModel>().InSingletonScope();
            this.Bind<IAppListViewModel>().To<AppListViewModel>().InSingletonScope();
        }

        #endregion
    }
}