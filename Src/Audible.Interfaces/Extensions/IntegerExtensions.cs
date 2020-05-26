
using System.Globalization;
using System.Text;

namespace Audible.Interfaces.Extensions
{
    public static class IntegerExtensions
    {

        public static string ToBase12(this uint instance)
        {
            return DecimalToBase12(instance, 12);
        }

        private static string DecimalToBase12(uint number, uint toBase)
        {
            var converted = new StringBuilder();

            do
            {
                var remainder = number % toBase;

                string result = string.Empty;

                if( remainder <= 9 )
                    result = remainder.ToString(CultureInfo.InvariantCulture);
                else if( remainder == 10 )
                    result = "A";
                else if( remainder == 11)
                    result = "B";

                converted.Insert(0, result);

                number /= toBase;
            }
            while (number > 0);

            return converted.ToString();
        }
    }
}
