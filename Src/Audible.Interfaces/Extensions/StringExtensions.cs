
namespace Audible.Interfaces.Extensions
{
    public static class StringExtensions
    {
        public static string ToBase12(this string instance)
        {
            if( string.IsNullOrEmpty(instance) )
                return string.Empty;

            var toInteger = (uint)int.Parse(instance);

            return toInteger.ToBase12();
        }
    }
}