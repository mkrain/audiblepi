using Audible.Interfaces.Provider;
using Audible.Interfaces.ViewModel;

namespace Audible.Service
{
    public class ViewModelLocator
    {
        public IAdProvider AdProvider
        {
            get { return Factory.Instance.GetInstance<IAdProvider>(); }
        }

        public INoteViewModel NoteViewModel
        {
            get { return Factory.Instance.GetInstance<INoteViewModel>(); }
        }

        public IPiViewModel PiViewModel
        {
            get { return Factory.Instance.GetInstance<IPiViewModel>(); }
        }

        public ISettingsViewmodel SettingsViewModel
        {
            get { return Factory.Instance.GetInstance<ISettingsViewmodel>(); }
        }

        public IAppListViewModel AppListViewModel
        {
            get { return Factory.Instance.GetInstance<IAppListViewModel>(); }
        }

        public IInfoViewModel InfoViewModel
        {
            get { return Factory.Instance.GetInstance<IInfoViewModel>(); }
        }
    }
}