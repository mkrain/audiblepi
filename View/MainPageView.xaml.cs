using Audible.Interfaces.Provider;
using Audible.Service;

using Common.Service;

using Microsoft.Phone.Controls;

namespace AudiblePi.View
{
    public partial class MainPage
    {
        private IAdProvider AdProvider
        {
            get
            {
                return Factory.Instance.GetInstance<IAdProvider>();
            }
        }

        // Constructor
        public MainPage()
        {
            this.InitializeComponent();

            this.NoteListPicker.SetValue(ListPicker.ItemCountThresholdProperty, 6);
            this.IntervalListPicker.SetValue(ListPicker.ItemCountThresholdProperty, 6);
            this.SkipListPicker.SetValue(ListPicker.ItemCountThresholdProperty, 6);
            this.DigitListPicker.SetValue(ListPicker.ItemCountThresholdProperty, 6);

            SetAdInformation();
        }

        private void SetAdInformation()
        {
            this.AudiblePiAdControl.AdUnitId = AdProvider.AdUnitId;
            this.AudiblePiAdControl.ApplicationId = AdProvider.ApplicationId;
        }

        /// <summary>
        /// 
        /// TODO: I don't like this but rather than slap this in the view model
        /// do it here.  Ideally I would be able to create the click handler
        /// xaml side but for now this is easier.
        /// 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ButtonClick(object sender, System.Windows.RoutedEventArgs e)
        {
            NavigationHelper.Instance.NavigateToRelativePageRequest("/YourLastAboutDialog;component/AboutPage.xaml");
        }
    }
}