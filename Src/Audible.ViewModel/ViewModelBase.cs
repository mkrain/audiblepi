using System;

using Audible.Interfaces.ViewModel;

using Common.Configuration;

namespace Audible.ViewModel
{
    public abstract class ViewModelBase : GalaSoft.MvvmLight.ViewModelBase, IPageViewModel
    {
        private readonly IPhoneConfiguration _phoneConfiguration;

        protected IPhoneConfiguration Configuration
        {
            get { return _phoneConfiguration; }
        }

        public abstract string PageName { get;  }
        public abstract string ImageIconUri { get; }

        protected ViewModelBase(IPhoneConfiguration configuration)
        {
            if( configuration == null )            
                throw new ArgumentNullException("configuration");
            
            _phoneConfiguration = configuration;
        }
    }
}