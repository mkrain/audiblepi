using System.Collections.Generic;

using Audible.Service.Module;

using Common.ServiceFactory;

using Ninject.Modules;

namespace Audible.Service
{
    public class Factory : Container
    {
        private static readonly Factory _factory = new Factory();

        public static Factory Instance
        {
            get
            {
                return _factory;
            }
        }

        #region Overrides of Container

        protected override IEnumerable<INinjectModule> Injectors()
        {
            var modules = 
                new List<INinjectModule>
                {
                    new AudibleCommonInjector(),
                    new AudibleModelInjector(),
                    new AudibleViewModelInjector()
                };

             return modules.ToArray();
        }

        #endregion
    }
}