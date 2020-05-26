namespace Audible.Interfaces
{
    public static class StringKey
    {
        public static class Constants
        {
            public static string Pi
            {
                get { return "3.14159"; }
            }

            public static string PiBase12
            {
                get { return "3.823B1"; }
            }
        }

        public static class ExceptionMessages
        {
            public static class IthDigit
            {
                public static string NoDigitsCalculated { get { return "Must call CalculatePi to generate a value first."; }}
                public static string IndexOutOfBounds { get { return "The specified digits was bigger than the calculated size."; }}
                public static string NegativeDigit { get { return "The specified digits was smaller than the calculated size."; }}
            }

            public static class AdProvider
            {
                public static string NegativeHeight { get { return "Height must have a positive size"; }}
                public static string NegativeWidth { get { return "Width must have a positive size"; }}
            }

            public static class BigNumber
            {
                public static string NumbersDifferentSizes { get { return "BigNumbers must have the same size"; }}
            }
            
        }

        public static class FormatStrings
        {
            public static class EnumHelper
            {
                public static string InvalidEnumType { get { return "Type '{0}' is not an enum"; }}
            }

            public static class ViewModel
            {
                public static class Pi
                {
                      public static string PlayingCount { get { return "Playing note: {0} of {1}"; }}
                }

                public static class Settings
                {
                    public static class CurrentDigit
                    {
                        public static string Pi { get { return "Calculating digit {0} of {1}"; } }
                        public static string ArcTan { get { return "Calculating arctan({0}) divisor {1}"; } }
                    }
                }
            }
        }

        public static class ViewModel
        {
            public static class Info
            {
                public static string PageName { get { return "Info"; }}
            }

            public static class Note
            {
                public static string PageName { get { return "Note"; }}
            }

            public static class Pi
            {
                public static string PageName { get { return "Calculate Pi"; }}                
            }

            public static class Settings
            {
                public static string PageName { get { return "Settings"; }}                
            }
        }
    }
}