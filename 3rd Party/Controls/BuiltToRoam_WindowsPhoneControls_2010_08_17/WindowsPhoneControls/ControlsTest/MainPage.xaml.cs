using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Microsoft.Phone.Controls;

namespace BuiltToRoam.WindowsPhone.Controls.Test
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Constructor
        public MainPage()
        {
            InitializeComponent();
        }

        private void PhoneApplicationPage_Loaded(object sender, RoutedEventArgs e)
        {
        }

        private void WheelBase_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var item = (this.Wheel1.SelectedItem as Expression.Blend.SampleData.SampleDataSource.Item);
            Console.Write(item.Text);
        }
    }
}
