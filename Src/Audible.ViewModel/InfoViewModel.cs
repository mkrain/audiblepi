
using Audible.Interfaces;
using Audible.Interfaces.ViewModel;

using Common.Configuration;

namespace Audible.ViewModel
{
    public class InfoViewModel : ViewModelBase, IInfoViewModel
    {
        #region Overrides of ViewModelBase

        public override string PageName
        {
            get { return StringKey.ViewModel.Info.PageName; }
        }

        public override string ImageIconUri
        {
            get { return "/Images/Info.png"; }
        }

        #endregion


        public InfoViewModel(IPhoneConfiguration configuration) : base(configuration)
        {
        }
    }
}