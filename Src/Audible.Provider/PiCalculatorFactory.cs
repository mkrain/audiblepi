
using System;

using Audible.Interfaces.Attributes.Pi;
using Audible.Interfaces.Provider;

namespace Audible.Provider
{
    public class PiCalculatorFactory : IPiCalculatorFactory
    {
        private readonly IPiCalculator _calculatedPi;
        private readonly IPiCalculator _streamedPi;

        #region Implementation of IPiCalculatorFactory

        public IPiCalculator CalculatedPi
        {
            get { return _calculatedPi; }
        }

        public IPiCalculator StreamedPi
        {
            get { return _streamedPi; }
        }

        #endregion

        public PiCalculatorFactory(
            [Computed] IPiCalculator calculatedPi, 
            [Streamed] IPiCalculator streamedPi)
        {
            if( calculatedPi == null )
                throw new ArgumentNullException("calculatedPi");
            if( streamedPi == null )
                throw new ArgumentNullException("streamedPi");

            _streamedPi = streamedPi;
            _calculatedPi = calculatedPi;
        }
    }
}