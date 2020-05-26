using System;
using System.Collections.Generic;
using System.Threading;

using Audible.Interfaces;
using Audible.Interfaces.Provider;


namespace Audible.Provider
{
    public class PiCalculator : IPiCalculator
    {
        private ComputedPi _computedPi;
        private BigNumber _leftNumber;
        private BigNumber _rightNumber;

        private static readonly ComputedPi _defaultComputedBase10Pi = new ComputedPi(StringKey.Constants.Pi);
        private static readonly ComputedPi _defaultComputedBase12Pi = new ComputedPi(StringKey.Constants.PiBase12);

        private bool _cancel;
        private bool _calculating;

        public event EventHandler<PiCalculatedEventArgs> PiCalculatedEvent;
        public event EventHandler<CalculatingPiEventArgs> CurrentDigitCalculatedEvent;
        public event EventHandler<CalculatingArcTanEventArgs> CurrentArcTanDivisorCalculatedEvent;

        private static readonly List<int> _numberOfDigits = new List<int> { 1000, 10000, 50000 };

        #region Implementation of IPiCalculator

        public bool IsCalculating
        {
            get { return _calculating; }
        }

        public ComputedPi DefaultComputedBase10Pi
        {
            get { return _defaultComputedBase10Pi; }
        }

        public ComputedPi DefaultComputedBase12Pi
        {
            get { return _defaultComputedBase12Pi; }
        }

        /// <summary>
        /// 
        /// Calculates pi to rounds decimal places, i.e.
        /// the string save is rounds + 1 sized.
        /// 
        /// </summary>
        /// <param name="rounds"></param>
        public void CalculatePiAsDecimal(int rounds)
        {
            this.CalculatePiAsynch(PiConversionOption.Decimal, rounds);
        }

        /// <summary>
        /// 
        /// Calculates pi to rounds decimal places, i.e.
        /// the string save is rounds + 1 sized.
        /// 
        /// </summary>
        /// <param name="rounds"></param>
        public void CalculatePiAsBase12(int rounds)
        {
            this.CalculatePiAsynch(PiConversionOption.Base12, rounds);
        }

        public void CalculatePiAsynch(PiConversionOption option, int rounds)
        {
            ThreadPool.QueueUserWorkItem(
                x =>
                {
                    SavePi(option, rounds);

                    _computedPi = _computedPi ?? 
                        ( option == PiConversionOption.Decimal ?
                    new ComputedPi(StringKey.Constants.Pi) :
                    new ComputedPi(StringKey.Constants.PiBase12) );

                    if( PiCalculatedEvent != null )
                        PiCalculatedEvent(this, new PiCalculatedEventArgs(_computedPi));
                });
        }

        public void Cancel()
        {
            _cancel = true;
            _calculating = false;

            _leftNumber.Cancel();
        }

        public IEnumerable<int> SupportedDigits
        {
            get { return _numberOfDigits; }
        }

        /// <summary>
        /// 
        /// Computes Pi based on the formula discovered by John Machin:
        /// 
        /// Pi/4 = 4*arctan(1/5) - arctan(1/239)
        /// 
        /// http://www.boyet.com/Articles/PiCalculator.html
        /// 
        /// and:
        /// 
        /// http://en.wikipedia.org/wiki/John_machin
        /// 
        /// and:
        /// 
        /// http://en.wikipedia.org/wiki/Pi
        /// 
        /// </summary>
        /// <param name="option">Whether to use base 10 or pseudo base 12</param>
        /// <param name="rounds">Digits of Pi to compute</param>
        private void SavePi(PiConversionOption option, int rounds)
        {
            if (_leftNumber == null)
            {
                _leftNumber = new BigNumber(rounds);
                _rightNumber = new BigNumber(rounds);

                _leftNumber.CurrentDigitCalculatedEvent += this.CurrentDigitCalculatedEvent;
                _leftNumber.CurrentArcTanDivisorCalculatedEvent += this.CurrentArcTanDivisorCalculatedEvent;
                _rightNumber.CurrentArcTanDivisorCalculatedEvent += this.CurrentArcTanDivisorCalculatedEvent;
            }
            else
            {
                _leftNumber.SetMaxDigits(rounds);
                _rightNumber.SetMaxDigits(rounds);
            }

            _cancel = false;
            _calculating = true;

            if( !_cancel )
                _leftNumber.ArcTan(16, 5);
            if( !_cancel )
                _rightNumber.ArcTan(4, 239);

            if( !_cancel )
                _leftNumber -= _rightNumber;

            if( !_cancel )
            {
                var result = option == PiConversionOption.Decimal ? 
                    _leftNumber.GetPiDigits() : 
                    _leftNumber.GetPiDigitsBase12();

#if DEBUG
                Console.WriteLine(result);
#endif
                _calculating = false;
                _computedPi = result;
            }
        }

        /// <summary>
        /// 
        /// Implements the first equation from the 'efficient currently known Machin-like formulas'
        /// section.
        /// 
        /// http://en.wikipedia.org/wiki/Machin-like_formula, (Hwang Chien-Lih) (1997)
        /// 
        /// </summary>
        //private void CalculateMachin1997(int rounds)
        //{
        //    var big183 = new BigNumber(rounds);
        //    var big32 = new BigNumber(rounds);
        //    var big68 = new BigNumber(rounds);
        //    var big12 = new BigNumber(rounds);
        //    var bigm12 = new BigNumber(rounds);
        //    var big100 = new BigNumber(rounds);

        //    big183.ArcTan(4 * 183, 239);
        //    big32.ArcTan(4 * 32, 1023);
        //    big68.ArcTan(4 * 68, 5832);
        //    big12.ArcTan(4 * 12, 110443);
        //    bigm12.ArcTan(4 * 12, 4841182);
        //    big100.ArcTan(4 * 100, 6826318);

        //    var result = big183 + big32 - big68 + big12 - bigm12 - big100;

        //    Console.WriteLine(result.ToString());
        //}

        /// <summary>
        /// 
        /// Implements the equation from the 'efficient currently known Machin-like formulas'
        /// section.
        /// 
        /// http://en.wikipedia.org/wiki/Machin-like_formula, (Hwang Chien-Lih) (2003)
        /// 
        /// This requires a larger precision value than can be had in WP7.
        /// 
        /// </summary>
        //private void CalculateMachin2003(int rounds)
        //{
        //    var big183 = new BigNumber(rounds);
        //    var big32 = new BigNumber(rounds);
        //    var big68 = new BigNumber(rounds);
        //    var big12a = new BigNumber(rounds);
        //    var big100 = new BigNumber(rounds);
        //    var big12b = new BigNumber(rounds);
        //    var big12c = new BigNumber(rounds);

        //    big183.ArcTan(4 * 183, 239);
        //    big32.ArcTan(4 * 32, 1023);
        //    big68.ArcTan(4 * 68, 5832);
        //    big12a.ArcTan(4 * 12, 113021);
        //    big100.ArcTan(4 * 100, 6826318);
        //    big12b.ArcTan(4 * 12, 33366019650);
        //    big12c.ArcTan(4 * 12, 43599522992503626068);

        //    var result = big183 + big32 - big68 + big12a - big100 - big12b + big12c;

        //    Console.WriteLine(result.ToString());
        //}

        #endregion
    }
}