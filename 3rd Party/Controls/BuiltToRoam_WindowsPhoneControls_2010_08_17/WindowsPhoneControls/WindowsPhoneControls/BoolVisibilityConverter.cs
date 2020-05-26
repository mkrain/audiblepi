using System;
using System.Windows;
using System.Windows.Data;

namespace BuiltToRoam.WindowsPhone.Controls
{
    public class BoolVisibilityConverter:IValueConverter
    {

        #region IValueConverter Members

        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (value is bool)
            {
                return ((bool)value) ? Visibility.Visible : Visibility.Collapsed;
            }
            return Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (value is Visibility)
            {
                return ((Visibility)value) == Visibility.Visible ? true : false;
            }
            return false;
        }

        #endregion
    }
}
