using Audible.Interfaces.ViewModel;

namespace Audible.ViewModel
{
    public class AppListViewModel : IAppListViewModel
    {
        #region Implementation of IPageViewModel

        public string PageName
        {
            get { return "Other apps you may be interested in."; }
        }

        public string ImageIconUri
        {
            get { return "/Images/Star.png"; }
        }

        #endregion

        #region Implementation of IAppListViewModel

        public string PublisherName
        {
            get { return "mkrain"; }
        }

        #endregion
    }
}