using System;
using System.Collections.Generic;

using Audible.Interfaces.Provider;

namespace Audible.Provider
{
    public class PiStreamCalculator : IPiCalculator
    {
        private readonly IPiIterator<string> _piIterator;

        public PiStreamCalculator(IPiIterator<string> piIterator)
        {
            if( piIterator == null )
                throw new ArgumentNullException("piIterator");

            _piIterator = piIterator;
        }

        #region Implementation of IPiCalculator

        public ComputedPi DefaultComputedBase10Pi
        {
            get { throw new NotImplementedException(); }
        }

        public ComputedPi DefaultComputedBase12Pi
        {
            get { throw new NotImplementedException(); }
        }

        public void CalculatePiAsDecimal(int rounds)
        {
            ResetAndSendCompleteMessage();
        }

        public void CalculatePiAsBase12(int rounds)
        {
            ResetAndSendCompleteMessage();
        }

        public bool IsCalculating
        {
            get { return false; }
        }

        public void Cancel()
        {
            ResetAndSendCompleteMessage();
        }

        public IEnumerable<int> SupportedDigits
        {
            get { return new List<int> { (int)_piIterator.Length }; }
        }

        public event EventHandler<PiCalculatedEventArgs> PiCalculatedEvent;
        public event EventHandler<CalculatingPiEventArgs> CurrentDigitCalculatedEvent;
        public event EventHandler<CalculatingArcTanEventArgs> CurrentArcTanDivisorCalculatedEvent;

        #endregion

        private void ResetAndSendCompleteMessage()
        {
            _piIterator.Reset();

            if( PiCalculatedEvent != null )
                this.PiCalculatedEvent(this, new PiCalculatedEventArgs(_piIterator));
        }
    }
}