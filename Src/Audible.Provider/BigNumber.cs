using System;
using System.Globalization;
using System.Linq;
using System.Text;
using Audible.Interfaces;
using Audible.Interfaces.Extensions;
using Audible.Interfaces.Provider;

namespace Audible.Provider
{
    public class BigNumber
    {
        public event EventHandler<CalculatingPiEventArgs> CurrentDigitCalculatedEvent;
        public event EventHandler<CalculatingArcTanEventArgs> CurrentArcTanDivisorCalculatedEvent;

        /// <summary>
        /// 
        /// Original implementation taken from:
        /// 
        /// http://www.boyet.com/Articles/PiCalculator.html
        /// 
        /// I've added operators for -,+,/ and *, rather than 
        /// having to call Add, etc explicitly. I.e. use
        /// 
        /// Given BigNumber a, b, instead of a.Method(b) you can use:
        /// 
        /// a -= b, or a /= b or a *= b or a += b
        /// 
        /// I've also done some OO cleanup, i.e. no public fields,
        /// use properties instead, UInt32 = uint.  
        /// 
        /// Added an event so the caller can determine where at in the
        /// the process the computation is at.
        /// 
        /// Added an additional method to update the max size
        /// without having to construct a new object.
        /// 
        /// </summary>
        private uint[] _number;
        private int _size;
        private int _maxDigits;
        private bool _cancel;

        private readonly CalculatingPiEventArgs _currentDigitPiEventArg;
        private readonly CalculatingArcTanEventArgs _currentArcTanDivisor;

        public int Size
        {
            get { return _size; }
        }

        public uint[] Number
        {
            get { return _number; }
        }

        public BigNumber(int maxDigits)
        {
            SetMaxDigits(maxDigits);

            _currentDigitPiEventArg = new CalculatingPiEventArgs();
            _currentArcTanDivisor = new CalculatingArcTanEventArgs();
        }

        public BigNumber(int maxDigits, uint intPart) : this(maxDigits)
        {
            _number[0] = intPart;

            for( int i = 1; i < _size; i++ )
            {
                _number[i] = 0;
            }
        }

        /// <summary>
        /// 
        /// Re-initializes this BigNumber to support the updated
        /// max digits value.
        /// 
        /// </summary>
        /// <param name="maxDigits">Number of Pi digits after 3.</param>
        public void SetMaxDigits(int maxDigits)
        {
            _maxDigits = maxDigits;
            _size = (int)Math.Ceiling(maxDigits * 0.104) + 2;
            _number = new UInt32[_size];
        }

        public void Assign(BigNumber value)
        {
            VerifySameSize(value);

            for( int i = 0; i < _size; i++ )
            {
                _number[i] = value._number[i];
            }
        }

        public bool IsZero()
        {
            return _number.All(item => item == 0);
        }

        /// <summary>
        /// 
        /// Uses the Maclaurin series to calculate arctan:
        /// 
        /// http://mathworld.wolfram.com/MaclaurinSeries.html and here:
        /// 
        /// http://en.wikipedia.org/wiki/Taylor_series#List_of_Maclaurin_series_of_some_common_functions
        /// 
        /// </summary>
        /// <param name="multiplicand"></param>
        /// <param name="reciprocal"></param>
        public void ArcTan(UInt32 multiplicand, UInt32 reciprocal)
        {
            _cancel = false;

            _currentArcTanDivisor.X =
                multiplicand.ToString(CultureInfo.InvariantCulture)
                + "/"
                + reciprocal.ToString(CultureInfo.InvariantCulture);
            
            var x = new BigNumber(_maxDigits, multiplicand);
            x /= reciprocal;
            reciprocal *= reciprocal;

            Assign(x);

            var term = new BigNumber(_maxDigits);
            uint divisor = 1;
            bool subtractTerm = true;

            while( !_cancel )
            {
                x /= reciprocal;

                term.Assign(x);

                divisor += 2;

                if( CurrentArcTanDivisorCalculatedEvent != null )
                {
                    _currentArcTanDivisor.Divisor = divisor;
                    CurrentArcTanDivisorCalculatedEvent(this, _currentArcTanDivisor);
                }

                term /= divisor;

                if( term.IsZero() )
                    break;

                if( subtractTerm )
                    Subtract(term);
                else
                    Add(term);

                subtractTerm = !subtractTerm;
            }
        }

        public void Cancel()
        {
            _cancel = true;
        }

        public static BigNumber operator -(BigNumber lhs, BigNumber rhs)
        {
           lhs.Subtract(rhs);

           return lhs;
        }

        public static BigNumber operator /(BigNumber lhs, uint rhs)
        {
            lhs.Divide(rhs);

            return lhs;
        }

        public ComputedPi GetPiDigits()
        {
            var temp = new BigNumber(_maxDigits);

            temp.Assign(this);

            var digits = new StringBuilder("3");
                  
            int digitCount = 0;

            while (digitCount < _maxDigits)
            {
                if (CurrentDigitCalculatedEvent != null)
                {
                    this._currentDigitPiEventArg.CurrentDigit = digitCount;
                    CurrentDigitCalculatedEvent(this, this._currentDigitPiEventArg);
                }

                temp.Number[0] = 0;
                temp.Multiply(100000);

                var piString = string.Format("{0:D5}", temp.Number[0]);
                var digit = piString.Substring(0, Math.Min(Math.Min(5, _maxDigits), piString.Length));

                if( digit.Contains("\0") )
                    break;

                digits.Append(digit);

                digitCount += 5;
            }

            return new ComputedPi(digits.ToString());
        }

        public ComputedPi GetPiDigitsBase12()
        {
            var temp = new BigNumber(_maxDigits);

            temp.Assign(this);

            var digits = new StringBuilder("3");

            int digitCount = 0;

            while (digitCount < _maxDigits)
            {
                if( CurrentDigitCalculatedEvent != null )
                {
                    _currentDigitPiEventArg.CurrentDigit = digitCount;
                    CurrentDigitCalculatedEvent(this, _currentDigitPiEventArg);
                }

                temp.Number[0] = 0;
                temp.Multiply(100000);

                var piString = temp.Number[0].ToBase12();// this.DecimalToBase12(temp.Number[0], 12);
                var cheapBase12 = piString.Substring(0, Math.Min(Math.Min(5, _maxDigits), piString.Length));

                if( cheapBase12.Contains("\0") )
                    break;

                digits.Append(cheapBase12);

                digitCount += 5;
            }

            return new ComputedPi(digits.ToString());
        }

        private static readonly string[] _baseChars = new [] { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B" };

        /// <summary>
        /// 
        /// Coverts the decimal digit in 'number' to 
        /// the specified base, up to 12.
        /// 
        /// </summary>
        /// <param name="number">Decimal digit</param>
        /// <param name="toBase">Base, 10 or 12</param>
        /// <returns></returns>
        private string DecimalToBase12(uint number, int toBase)
        {
            var converted = new StringBuilder();

            do
            {
                var result = _baseChars[number % toBase];

                converted.Insert(0, result);

                number /= (uint)toBase;
            }
            while (number > 0);

            return converted.ToString();
        }

        public void VerifySameSize(BigNumber value)
        {
            if( value.Size != this.Size )
                throw new Exception(StringKey.ExceptionMessages.BigNumber.NumbersDifferentSizes);
        }

        private void Add(BigNumber value)
        {
            VerifySameSize(value);

            int index = _size - 1;

            while (index >= 0 && value.Number[index] == 0)
                index--;

            uint carry = 0;

            while (index >= 0)
            {
                UInt64 result =
                    (UInt64)_number[index]
                    + value.Number[index] + carry;

                Number[index] = (uint)result;

                if (result >= 0x100000000U)
                    carry = 1;
                else
                    carry = 0;
                index--;
            }
        }

        private void Subtract(BigNumber value)
        {
            VerifySameSize(value);

            int index = _size - 1;
            while (index >= 0 && value.Number[index] == 0)
                index--;

            uint borrow = 0;
            while (index >= 0)
            {
                UInt64 result = 0x100000000U + _number[index] -
                                value.Number[index] - borrow;
                _number[index] = (uint)result;
                if (result >= 0x100000000U)
                    borrow = 0;
                else
                    borrow = 1;
                index--;
            }
        }

        private void Multiply(uint value)
        {
            int index = _size - 1;
            while (index >= 0 && _number[index] == 0)
                index--;

            uint carry = 0;
            while (index >= 0)
            {
                UInt64 result = (UInt64)_number[index] * value + carry;
                _number[index] = (uint)result;
                carry = (uint)(result >> 32);
                index--;
            }
        }

        private void Divide(uint value)
        {
            int index = 0;
            while (index < _size && _number[index] == 0)
                index++;

            UInt32 carry = 0;
            while (index < _size)
            {
                UInt64 result = _number[index] + ((UInt64)carry << 32);
                _number[index] = (UInt32)(result / value);
                carry = (UInt32)(result % value);
                index++;
            }
        }
    }
}