
namespace Audible.Interfaces
{
    public static class ConfigKey
    {
        public static string Invalid { get { return "Invalid"; } }
        public static string SelectedSkipDigit { get { return "SelectedSkipDigit"; } }
        public static string IsSoundLooped { get { return "IsSoundLooped"; } }
        public static string IsPiComputed { get { return "IsPiComputed"; } }
        public static string IsBase10 { get { return "IsBase10"; } }
        public static string BaseCalculation { get { return "BaseCalculation"; } }
        public static string SelectedNumberOfDigits { get { return "SelectedNumberOfDigits"; } }
        public static string SupportedDigits { get { return "SupportedDigits"; } }
        public static string SelectedNoteInterval { get { return "SelectedNoteInterval"; } }
        public static string SelectedTempo { get { return "SelectedTempo"; } }
        public static string SelectedNoteType { get { return "SelectedNoteType"; } }

        public static class ViewModel
        {
            public static string PiView { get { return "Pi"; } }
            public static string Settings { get { return "Settings"; } }
            public static string Note { get { return "Note"; } }
        }

        public static class Update
        {
            public static string CalculatingDigit { get { return "Calculating"; } }
            public static string CurrentDigit { get { return "CurrentDigit"; } }
            public static string IsCalculating { get { return "IsCalculating"; } }
            public static string ContentVisiblity { get { return "ContentVisiblity"; } }
        }

        public static class Ad
        {
            public static string SmallProvider { get { return "SmallAdProvider"; } }
            public static string LargeProvider { get { return "LargeAdProvider"; } }
        }
    }
}