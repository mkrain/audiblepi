using Audible.Interfaces;
using Audible.Interfaces.Attributes.Ad;
using Audible.Interfaces.Attributes.Pi;
using Audible.Interfaces.Provider;
using Audible.Provider;
using Audible.Provider.Ads;

using Ninject.Modules;

namespace Audible.Service.Module
{
    public class AudibleCommonInjector : NinjectModule
    {
#if DEBUG
        private const string AD_UNIT_ID_SMALL = "Image300_50";
        private const string APPLICATION_ID_SMALL = "test_client";
        private const string AD_UNIT_ID_LARGE = "Image480_80";
        private const string APPLICATION_ID_LARGE = "test_client";
#else
        private const string AD_UNIT_ID_SMALL = "REDACTED";
        private const string APPLICATION_ID_SMALL = "REDACTED";
        private const string AD_UNIT_ID_LARGE = "REDACTED";
        private const string APPLICATION_ID_LARGE = "REDACTED";
#endif

        private readonly IAdProvider _smallAd;
        private readonly IAdProvider _largeAd;

        public AudibleCommonInjector()
        {
            _smallAd = new SmallAdProvider(AD_UNIT_ID_SMALL, APPLICATION_ID_SMALL);
            _largeAd = new LargeAdProvider(AD_UNIT_ID_LARGE, APPLICATION_ID_LARGE);
        }

        #region Overrides of NinjectModule

        public override void Load()
        {
            this.Bind<INoteProvider>().To<NoteProvider>().InSingletonScope();

            this.Bind<IPiCalculator>().To<PiCalculator>()
                .WhenTargetHas<ComputedAttribute>()
                .InSingletonScope();
            this.Bind<IPiCalculator>().To<PiStreamCalculator>()
                .WhenTargetHas<StreamedAttribute>()
                .InSingletonScope();
            this.Bind<IPiCalculatorFactory>().To<PiCalculatorFactory>().InSingletonScope();

            this.Bind<IPiIterator<string>>().To<PiStreamIterator>().InSingletonScope();
            this.Bind<IIconProvider>().To<IconProvider>().InSingletonScope();

            //Default Ad Provider
            this.Bind<IAdProvider>()
                .ToConstant(_smallAd)
                .WhenTargetHas<SmallAdAttribute>()
                .InSingletonScope()
                .Named(ConfigKey.Ad.SmallProvider);
            this.Bind<IAdProvider>()
                .ToConstant(_largeAd)
                .WhenTargetHas<LargeAdAttribute>()
                .InSingletonScope()
                .Named(ConfigKey.Ad.LargeProvider);
            this.Bind<IAdProvider>()
                .ToConstant(_largeAd)
                .InSingletonScope();
        }

        #endregion
    }
}
