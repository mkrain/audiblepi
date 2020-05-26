using System.Windows;
using System.Windows.Navigation;

#if !DEBUG

#endif
using Common.Service;

using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;

namespace AudiblePi
{
    public partial class App
    {
        private static NavigationHelper _service;

        /// <summary>
        /// Provides easy access to the root frame of the Phone Application.
        /// </summary>
        /// <returns>The root frame of the Phone Application.</returns>
        private static PhoneApplicationFrame RootFramePage { get; set; }

        //private static Uri CurrentPage
        //{
        //    get
        //    {
        //        return RootFramePage.CurrentSource;
        //    }
        //}

        /// <summary>
        /// Constructor for the Application object.
        /// </summary>
        public App()
        {
            // Global handler for uncaught exceptions. 
            UnhandledException += Application_UnhandledException;

            // Standard Silverlight initialization
            InitializeComponent();

            // Phone-specific initialization
            InitializePhoneApplication();

            //var hacked = IsHacked();

            // Show graphics profiling information while debugging.
            if (System.Diagnostics.Debugger.IsAttached)
            {
                // Display the current frame rate counters.
                //Application.Current.Host.Settings.EnableFrameRateCounter = true;

                // Show the areas of the app that are being redrawn in each frame.
                //Application.Current.Host.Settings.EnableRedrawRegions = true;

                // Enable non-production analysis visualization mode, 
                // which shows areas of a page that are handed off to GPU with a colored overlay.
                //Application.Current.Host.Settings.EnableCacheVisualization = true;

                // Disable the application idle detection by setting the UserIdleDetectionMode property of the
                // application's PhoneApplicationService object to Disabled.
                // Caution:- Use this under debug mode only. Application that disables user idle detection will continue to run
                // and consume battery power when the user is not using the phone.
                PhoneApplicationService.Current.UserIdleDetectionMode = IdleDetectionMode.Disabled;
            }

        }

        // Code to execute when the application is launching (eg, from Start)
        // This code will not execute when the application is reactivated
        private void Application_Launching(object sender, LaunchingEventArgs e)
        {
        }

        // Code to execute when the application is activated (brought to foreground)
        // This code will not execute when the application is first launched
        private void Application_Activated(object sender, ActivatedEventArgs e)
        {
        }

        // Code to execute when the application is deactivated (sent to background)
        // This code will not execute when the application is closing
        private void Application_Deactivated(object sender, DeactivatedEventArgs e)
        {
        }

        // Code to execute when the application is closing (eg, user hit Back)
        // This code will not execute when the application is deactivated
        private void Application_Closing(object sender, ClosingEventArgs e)
        {
        }

        // Code to execute if a navigation fails
        private void RootFrame_NavigationFailed(object sender, NavigationFailedEventArgs e)
        {
            if (System.Diagnostics.Debugger.IsAttached)
            {
                // A navigation has failed; break into the debugger
                System.Diagnostics.Debugger.Break();
            }
        }

        // Code to execute on Unhandled Exceptions
        private void Application_UnhandledException(object sender, ApplicationUnhandledExceptionEventArgs e)
        {
            if (System.Diagnostics.Debugger.IsAttached)
            {
                // An unhandled exception has occurred; break into the debugger
                System.Diagnostics.Debugger.Break();
            }
        }

        #region Phone application initialization

        // Avoid double-initialization
        private bool _phoneApplicationInitialized;

        // Do not add any additional code to this method
        private void InitializePhoneApplication()
        {
            if (_phoneApplicationInitialized)
                return;

            // Create the frame but don't set it as RootVisual yet; this allows the splash
            // screen to remain active until the application is ready to render.
            RootFramePage = new TransitionFrame();
            RootFramePage.Navigated += CompleteInitializePhoneApplication;

            // Handle navigation failures
            RootFramePage.NavigationFailed += RootFrame_NavigationFailed;

            _service = NavigationHelper.Instance;
            _service.InitializeRootFrame(RootFramePage);

            // Ensure we don't initialize again
            _phoneApplicationInitialized = true;
        }

        // Do not add any additional code to this method
        private void CompleteInitializePhoneApplication(object sender, NavigationEventArgs e)
        {
            // Set the root visual to allow the application to render
            //if( RootVisual != RootFramePage )
            RootVisual = RootFramePage;

            // Remove this handler since it is no longer needed
            RootFramePage.Navigated -= CompleteInitializePhoneApplication;
        }

        #endregion

        //protected virtual void SettingsMenuItemClick(object sender, EventArgs e)
        //{
        //    NavigateToPageRequest("Settings");
        //}

        //protected virtual void MainMenuItemClick(object sender, EventArgs e)
        //{
        //    NavigateToPageRequest("MainPage");
        //}

        //protected virtual void AboutMenuItemClick(object sender, EventArgs e)
        //{
        //    _service.NavigateToRelativePageRequest("/YourLastAboutDialog;component/AboutPage.xaml");
        //}

        //private static void NavigateToPageRequest(string page)
        //{
        //    if( CurrentPage.OriginalString.Contains(page) )
        //        return;

        //    if( _service == null )
        //    {
        //        _service = NavigationHelper.Instance;
        //        _service.InitializeRootFrame(RootFramePage);
        //    }

        //    _service.NavigateToRelativePageRequest(string.Format("/View/{0}View.xaml", page));
        //}

        //        public static bool IsHacked()
//        {
//            try
//            {
//#if DEBUG
//                return false;                
//#endif
//                string fl = "WMAppPRHeader.xml";
//                XDocument doc = XDocument.Load(fl); //is hacked, this file is missing or empty!!!

//                return false;
//            }
//            catch//( Exception )
//            {
//                //MessageBox.Show("This app was pirated and is not safe to use, please download the original one from Marketplace.");

//                var productId = Coding4Fun.Phone.Controls.Data.PhoneHelper.GetAppAttribute("ProductID");

//                var marketplaceDetailTask =
//                    new MarketplaceDetailTask
//                    {
//                        ContentIdentifier = productId.Replace("{", string.Empty).Replace("}", string.Empty).Trim(),
//                        ContentType = MarketplaceContentType.Applications
//                    };

//                marketplaceDetailTask.Show();

//                return true;
//            }
//        }
    }
}