using System;

using Audible.Interfaces;
using Audible.Interfaces.Provider;

namespace Audible.Provider.Ads
{
    public abstract class BaseAdProvider : IAdProvider
    {
        #region Implementation of IAdProvider

        public string AdUnitId { get; private set; }

        public string ApplicationId { get; private set; }

        public int Height { get; private set; }
        public int Width { get; private set; }

        #endregion

        protected BaseAdProvider(string adUnitId, string applicationId, int height, int width)
        {
            if( string.IsNullOrEmpty(adUnitId) )
                throw new ArgumentNullException("adUnitId");
            if( string.IsNullOrEmpty(applicationId) )
                throw new ArgumentNullException("applicationId");
            if( height <= 0 )
                throw new ArgumentException(StringKey.ExceptionMessages.AdProvider.NegativeHeight);
            if( width <= 0 )
                throw new ArgumentException(StringKey.ExceptionMessages.AdProvider.NegativeWidth);

            this.AdUnitId = adUnitId;
            this.ApplicationId = applicationId;
            this.Width = width;
            this.Height = height;
        }
    }
}