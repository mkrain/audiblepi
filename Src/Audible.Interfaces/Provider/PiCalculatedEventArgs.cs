using System;

namespace Audible.Interfaces.Provider
{
    public class PiCalculatedEventArgs : EventArgs
    {
        private readonly IPiIterator<string> _calculatedPi;

        public IPiIterator<string> CalculatedPi
        {
            get { return _calculatedPi; }
        }

        public PiCalculatedEventArgs(IPiIterator<string> calculatedPi)
        {
            _calculatedPi = calculatedPi;
        }
    }
}